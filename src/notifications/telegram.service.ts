import { Injectable, Logger } from "@nestjs/common";
import { createHash, createHmac, timingSafeEqual } from "crypto";

export type TelegramLoginPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  get botToken(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN?.trim();
  }

  get botUsername(): string | undefined {
    return process.env.TELEGRAM_BOT_USERNAME?.trim()?.replace(/^@/, "");
  }

  get enabled(): boolean {
    return Boolean(this.botToken);
  }

  verifyLogin(payload: TelegramLoginPayload): boolean {
    if (!this.botToken) return false;
    const { hash, ...rest } = payload;
    const checkString = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${String((rest as Record<string, unknown>)[key] ?? "")}`)
      .join("\n");
    const secret = createHash("sha256").update(this.botToken).digest();
    const hmac = createHmac("sha256", secret).update(checkString).digest("hex");
    try {
      return timingSafeEqual(Buffer.from(hmac), Buffer.from(hash));
    } catch {
      return false;
    }
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    if (!this.botToken) {
      this.logger.log(`[telegram:log] chat=${chatId}\n${text}`);
      return;
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
          }),
        }
      );
      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Telegram API ${response.status}: ${body}`);
      }
    } catch (error) {
      this.logger.error(
        `Telegram send failed: ${
          error instanceof Error ? error.message : "ошибка"
        }`
      );
    }
  }
}
