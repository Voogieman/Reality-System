export type CommunicationTone = 'direct' | 'gentle' | 'images';

export type WandererProfile = {
  situation: string;
  tone: CommunicationTone;
  need?: string;
  preferredGodId?: string;
  matchReason?: string;
};

export type WandererSituation = { id: string; label: string };

export type WandererCategory = {
  id: string;
  label: string;
  hint: string;
  situations: WandererSituation[];
};

export const WANDERER_CATEGORIES: WandererCategory[] = [
  {
    id: 'path',
    label: 'Путь и ясность',
    hint: 'Когда не видишь, куда идти',
    situations: [
      { id: 'stuck', label: 'Запутался и не вижу тропу' },
      { id: 'clarity', label: 'Всё смешалось, нужна ясность' },
      { id: 'threshold', label: 'Стою на пороге и боюсь шага' },
      { id: 'decide', label: 'Нужно решиться и действовать' },
    ],
  },
  {
    id: 'work',
    label: 'Дело и труд',
    hint: 'Когда руки заняты, а плода нет',
    situations: [
      { id: 'harvest', label: 'Труд есть, плода нет' },
      { id: 'craft', label: 'Дело не спорится в руках' },
      { id: 'fire', label: 'Сил мало, нужен жар и движение' },
    ],
  },
  {
    id: 'home',
    label: 'Дом и люди',
    hint: 'Семья, союз, нити между вами',
    situations: [
      { id: 'family', label: 'Дело в семье и нитях' },
      { id: 'union', label: 'Нет согласия в союзе' },
    ],
  },
  {
    id: 'change',
    label: 'Перемена',
    hint: 'Ветер, слом, рубеж дня',
    situations: [
      { id: 'wind', label: 'Жду вестей и перемены' },
      { id: 'storm', label: 'Всё резко меняется, шумно вокруг' },
      { id: 'break', label: 'Пора сломать отжившее' },
      { id: 'dawn', label: 'На рубеже ночи и дня' },
    ],
  },
  {
    id: 'shadow',
    label: 'Тень и покой',
    hint: 'Горе, тишина, спешка',
    situations: [
      { id: 'grief', label: 'Пора отпустить и пережить зиму' },
      { id: 'night', label: 'Спешка слепит, нужна тишина' },
    ],
  },
  {
    id: 'kin',
    label: 'Род и правда',
    hint: 'Предки, суд, охрана',
    situations: [
      { id: 'kin', label: 'Тянет род и память предков' },
      { id: 'truth', label: 'Нужен суд, не утешение' },
      { id: 'guard', label: 'Нужна защита порога и дома' },
    ],
  },
];

export const WANDERER_SITUATIONS: WandererSituation[] = WANDERER_CATEGORIES.flatMap(
  (category) => category.situations,
);

export function getWandererCategory(id: string): WandererCategory | undefined {
  return WANDERER_CATEGORIES.find((category) => category.id === id);
}

export function getWandererSituation(id: string): WandererSituation | undefined {
  return WANDERER_SITUATIONS.find((item) => item.id === id);
}

export const WANDERER_TONES: { id: CommunicationTone; label: string; hint: string }[] = [
  { id: 'direct', label: 'Прямо', hint: 'Коротко, один шаг, без жалости' },
  { id: 'gentle', label: 'Мягко', hint: 'Держать за руку, не давить' },
  { id: 'images', label: 'Образами', hint: 'Знак и картина, не инструкция' },
];

const PROFILE_KEY = 'veles-wanderer-profile';
const WELCOME_KEY = 'veles-welcome-seen';

export function readWandererProfile(): WandererProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as WandererProfile) : null;
  } catch {
    return null;
  }
}

export function writeWandererProfile(profile: WandererProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* ignore */
  }
}
