import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { EmailService } from "./email.service";
import { TelegramService } from "./telegram.service";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly email: EmailService,
    private readonly telegram: TelegramService
  ) {}

  async notifyUser(
    userId: string,
    subject: string,
    text: string,
    options?: { email?: boolean; telegram?: boolean }
  ): Promise<void> {
    const wantEmail = options?.email ?? true;
    const wantTelegram = options?.telegram ?? true;
    const user = await this.databaseService.getUserById(userId);
    if (!user) {
      this.logger.warn(`notifyUser: user ${userId} not found`);
      return;
    }

    if (wantEmail && user.email && !user.email.endsWith("@telegram.local")) {
      await this.email.send(user.email, subject, text);
    }

    if (wantTelegram && user.telegramChatId) {
      await this.telegram.sendMessage(user.telegramChatId, `${subject}\n\n${text}`);
    }
  }
}
