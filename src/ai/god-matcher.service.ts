import { Injectable, Logger } from "@nestjs/common";
import { SLAVIC_GODS, SLAVIC_GOD_IDS } from "../gods/slavic-gods.constants";
import { OpenAiChatService } from "./openai-chat.service";
import { AiConfigService } from "./ai-config.service";

export const SITUATION_TO_GOD: Record<string, string> = {
  stuck: "veles",
  decide: "perun",
  harvest: "dazhbog",
  family: "mokosh",
  union: "lada",
  clarity: "belobog",
  break: "chernobog",
  truth: "vyshen",
  craft: "svarog",
  wind: "stribog",
  storm: "posvist",
  threshold: "yaginya",
  grief: "morana",
  fire: "yarilo",
  kin: "rod",
  guard: "simargl",
  night: "khors",
  dawn: "zorya",
};

export type GodMatchInput = {
  situation: string;
  need?: string;
  tone?: string;
};

export type GodMatchResult = {
  godId: string;
  godName: string;
  reason: string;
  source: "oracle" | "sign";
};

@Injectable()
export class GodMatcherService {
  private readonly logger = new Logger(GodMatcherService.name);

  constructor(
    private readonly chat: OpenAiChatService,
    private readonly config: AiConfigService
  ) {}

  async match(input: GodMatchInput): Promise<GodMatchResult> {
    const heuristic = this.heuristic(input);
    if (!this.config.enabled) {
      return { ...heuristic, source: "sign" };
    }

    try {
      const catalog = Object.entries(SLAVIC_GODS)
        .map(([id, god]) => `${id}: ${god.name} — ${god.domain}. ${god.description}`)
        .join("\n");

      const raw = await this.chat.complete(
        [
          {
            role: "system",
            content:
              "Ты жрец-оракул славянского пантеона. По ситуации странника выбери ОДНОГО бога. Ответь строго JSON без разметки: {\"godId\":\"veles\",\"reason\":\"кратко почему\"}. godId только из списка.",
          },
          {
            role: "user",
            content: [
              `Ситуация: ${input.situation}`,
              input.need ? `Что нужно: ${input.need}` : "",
              input.tone ? `Как говорить: ${input.tone}` : "",
              "",
              "Пантеон:",
              catalog,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
        { temperature: 0.4, maxTokens: 220 }
      );

      const parsed = this.parseJson(raw);
      const godId = parsed && SLAVIC_GOD_IDS.includes(parsed.godId)
        ? parsed.godId
        : heuristic.godId;
      const god = SLAVIC_GODS[godId];
      return {
        godId,
        godName: god.name,
        reason: parsed?.reason?.trim() || heuristic.reason,
        source: "oracle",
      };
    } catch (error) {
      this.logger.warn(
        `God match LLM failed, using sign: ${
          error instanceof Error ? error.message : "ошибка"
        }`
      );
      return { ...heuristic, source: "sign" };
    }
  }

  private heuristic(input: GodMatchInput): GodMatchResult {
    const keys = input.situation
      .split(/[,;]+/)
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    const mapped = keys.map((key) => SITUATION_TO_GOD[key]).find(Boolean);
    const godId =
      mapped ?? this.fromText(`${input.situation} ${input.need ?? ""}`);
    const god = SLAVIC_GODS[godId] ?? SLAVIC_GODS.veles;
    return {
      godId: SLAVIC_GODS[godId] ? godId : "veles",
      godName: god.name,
      reason: `Этот голос ближе к твоей ситуации — ${god.domain.toLowerCase()}.`,
      source: "sign",
    };
  }

  private fromText(text: string): string {
    const t = text.toLowerCase();
    if (/семь|нит|отношен|мать|дом/.test(t)) return "mokosh";
    if (/любов|лад|союз|мир в/.test(t)) return "lada";
    if (/разруш|отпуст|отжив|слом/.test(t)) return "chernobog";
    if (/смерт|зим|горе|утрат/.test(t)) return "morana";
    if (/реш|действ|смел|удар/.test(t)) return "perun";
    if (/труд|плод|урожа|свет/.test(t)) return "dazhbog";
    if (/ков|работ|дел/.test(t)) return "svarog";
    if (/правд|суд|справедл/.test(t)) return "vyshen";
    if (/порог|туман|лес|страш/.test(t)) return "yaginya";
    if (/род|предк|памят/.test(t)) return "rod";
    if (/ветр|вест|перемен/.test(t)) return "stribog";
    if (/тишин|ноч|ждать/.test(t)) return "khors";
    if (/заря|рассвет|рубеж/.test(t)) return "zorya";
    return "veles";
  }

  private parseJson(raw: string): { godId: string; reason?: string } | null {
    const trimmed = raw.trim().replace(/^```json\s*|\s*```$/g, "");
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      const json = JSON.parse(trimmed.slice(start, end + 1)) as {
        godId?: string;
        reason?: string;
      };
      if (!json.godId) return null;
      return { godId: json.godId, reason: json.reason };
    } catch {
      return null;
    }
  }
}
