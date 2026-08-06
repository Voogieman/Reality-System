import { Injectable } from "@nestjs/common";

@Injectable()
export class AiConfigService {
  get apiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  get baseUrl(): string {
    return (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
      /\/$/,
      ""
    );
  }

  get model(): string {
    return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }

  get enabled(): boolean {
    return Boolean(this.apiKey?.trim());
  }

  get maxTokens(): number {
    return Number(process.env.OPENAI_MAX_TOKENS ?? 700);
  }

  /** Базовая «магичность» ответа; для Велеса может быть выше через профиль бога */
  get oracleTemperature(): number {
    return Number(process.env.OPENAI_ORACLE_TEMPERATURE ?? 0.88);
  }
}
