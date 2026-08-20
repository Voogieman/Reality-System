import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { EmailService } from "./email.service";
import { NotificationService } from "./notification.service";
import { TelegramService } from "./telegram.service";

@Module({
  imports: [DatabaseModule],
  providers: [EmailService, TelegramService, NotificationService],
  exports: [EmailService, TelegramService, NotificationService],
})
export class NotificationsModule {}
