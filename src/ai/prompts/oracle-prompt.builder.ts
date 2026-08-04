import { SLAVIC_GODS, type SlavicGodDefinition } from '../../gods/slavic-gods.constants';
import type { OracleContext } from '../god-oracle.service';
import { DEFAULT_ORACLE_PROFILE, GOD_ORACLE_PROFILES } from './god-oracle-profiles';
import type { GodOracleProfile } from './oracle.types';
export type BuiltOraclePrompt = {
    systemMessages: string[];
    userMessage: string;
    temperature: number;
};

const REALM_GLOSSARY = `
Три мира славянской космологии:
— Явь: мир живых, видимый и осязаемый.
— Навь: мир предков, духов, снов и теней; здесь хранятся тайны рода.
— Правь: высший мир богов, законов и света.
Сумерки и полночь — время, когда границы миров тонки.
`.trim();

export function buildOraclePrompt(context: OracleContext): BuiltOraclePrompt {
    const god = SLAVIC_GODS[context.godName];
    const profile = GOD_ORACLE_PROFILES[context.godName] ?? DEFAULT_ORACLE_PROFILE;

    const systemMessages = [
        buildPersonaLayer(god, profile),
        buildVoiceLayer(profile),
        buildFormatLayer(profile),
        REALM_GLOSSARY,
        buildTaboosLayer(profile),
    ];

    return {
        systemMessages,
        userMessage: buildUserLayer(context, god, profile),
        temperature: profile.temperature ?? DEFAULT_ORACLE_PROFILE.temperature ?? 0.85,
    };
}

function buildPersonaLayer(god: SlavicGodDefinition, profile: GodOracleProfile): string {
    const offerings = god.preferredOfferings.join(', ');
    const loreBlock = profile.lore.length > 0 ? profile.lore.join('\n') : god.description;

    return [
        `РОЛЬ: Ты — ${god.name}. ${profile.epithet}.`,
        `Сфера влияния: ${god.domain}. Стихия: ${god.element}.`,
        `Символы: ${god.symbols.join(', ')}. Священные миры: ${god.realms.join(', ')}.`,
        `Принимаемые подношения: ${offerings}.`,
        '',
        'МИФОЛОГИЧЕСКИЙ КАНОН:',
        loreBlock,
    ].join('\n');
}

function buildVoiceLayer(profile: GodOracleProfile): string {
    return [
        'ГОЛОС И СТИЛЬ:',
        ...profile.voiceRules.map((r) => `— ${r}`),
        '',
        'ОБРАЗЫ (используй 2–3 в ответе):',
        profile.imagery.join(', '),
    ].join('\n');
}

function buildFormatLayer(profile: GodOracleProfile): string {
    const { responseFormat } = profile;
    return [
        'СТРУКТУРА ОТВЕТА (соблюдай порядок):',
        ...responseFormat.sections.map((s, i) => `${i + 1}. ${s}`),
        '',
        `Объём: ${responseFormat.minParagraphs}–${responseFormat.maxParagraphs} абзацев. Язык: русский.`,
        responseFormat.closingStyle,
    ].join('\n');
}

function buildTaboosLayer(profile: GodOracleProfile): string {
    return ['ЗАПРЕТЫ:', ...profile.taboos.map((t) => `— ${t}`)].join('\n');
}

function buildUserLayer(
    context: OracleContext,
    god: SlavicGodDefinition,
    profile: GodOracleProfile,
): string {
    const lines: string[] = [
        `К тебе, ${god.name}, пришёл странник.`,
    ];

    if (context.userId) {
        lines.push(`Имя/метка духа: ${context.userId}.`);
    }

    if (context.offeringType != null) {
        const purity = context.purity ?? 0;
        const significance = context.significance ?? 0;
        lines.push(
            `Подношение: ${context.offeringType}.`,
            `Чистота подношения: ${purity} из 100. Значимость: ${significance} из 100.`,
            interpretOffering(purity, significance, profile),
        );
    } else {
        lines.push('Подношение не принесено — ответь как на чистый вопрос духа, без полного ритуала.');
    }

    lines.push(
        '',
        `НАМЕРЕНИЕ СТРАННИКА: «${context.intention}»`,
        '',
        timeOfDayHint(god.name),
        '',
        `Ответь как ${god.name}. Дай пророчество в установленной структуре.`,
    );

    return lines.join('\n');
}

function interpretOffering(
    purity: number,
    significance: number,
    profile: GodOracleProfile,
): string {
    const score = (purity + significance) / 2;

    if (score >= 85 && profile.highOfferingTone) {
        return `ТОН ОТВЕТА: ${profile.highOfferingTone}`;
    }
    if (score < 60 && profile.lowOfferingTone) {
        return `ТОН ОТВЕТА: ${profile.lowOfferingTone}`;
    }
    if (purity < 70) {
        return 'ТОН ОТВЕТА: подношение недостаточно чисто — укажи на очищение перед глубоким знанием.';
    }
    return 'ТОН ОТВЕТА: подношение принято — открой знамение и наставление.';
}

function timeOfDayHint(godName: string): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 8) {
        return 'ВРЕМЯ: заря — граница ночи и дня, уместны образы пробуждения и новых троп.';
    }
    if (hour >= 17 && hour < 21) {
        if (godName === 'Велес') {
            return 'ВРЕМЯ: сумерки — врата Нави приоткрыты; голос Велеса особенно силён.';
        }
        return 'ВРЕМЯ: сумерки — граница миров тонка; говори глубже и образнее.';
    }
    if (hour >= 21 || hour < 5) {
        if (godName === 'Хорс' || godName === 'Чернобог') {
            return 'ВРЕМЯ: ночь — твоя сила полна; говори из глубины тьмы и лунного света.';
        }
        return 'ВРЕМЯ: ночь и Навь — тайны рода и предков ближе; говори глубже, но осторожнее.';
    }
    if (godName === 'Даждьбог' || godName === 'Ярило') {
        return 'ВРЕМЯ: день — солнечная сила в полную; ответь ярко и жизнеутверждающе.';
    }
    return 'ВРЕМЯ: день в Яви — ответь ясно, с образами земли, неба и природы.';
}
