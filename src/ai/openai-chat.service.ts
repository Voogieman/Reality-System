import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AiConfigService } from "./ai-config.service";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatCompletionOptions = {
  temperature?: number;
  maxTokens?: number;
};

@Injectable()
export class OpenAiChatService {
  private readonly logger = new Logger(OpenAiChatService.name);

  constructor(private readonly config: AiConfigService) {}

  async complete(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      throw new ServiceUnavailableException(
        "ИИ-оракул не настроен. Укажите OPENAI_API_KEY в .env"
      );
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: options.maxTokens ?? this.config.maxTokens,
        temperature: options.temperature ?? this.config.oracleTemperature,
      }),
    });

    const body: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errText = this.extractError(body);
      this.logger.error(`OpenAI API ${response.status}: ${errText}`);
      throw new ServiceUnavailableException(`Оракул молчит: ${errText}`);
    }

    const text = this.extractContent(body);
    if (!text) {
      throw new ServiceUnavailableException("Оракул вернул пустой ответ");
    }

    return text.trim();
  }

  private extractContent(body: unknown): string | undefined {
    if (!body || typeof body !== "object") return undefined;
    const choices = (
      body as { choices?: Array<{ message?: { content?: string } }> }
    ).choices;
    return choices?.[0]?.message?.content;
  }

  private extractError(body: unknown): string {
    if (!body || typeof body !== "object") return "неизвестная ошибка";
    const err = (body as { error?: { message?: string } }).error?.message;
    return err ?? "ошибка провайдера ИИ";
  }
}
