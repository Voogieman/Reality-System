import { Injectable, Logger } from "@nestjs/common";
import nodemailer, { type Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    if (!host) {
      this.logger.warn(
        "SMTP_HOST не задан — письма пишутся в лог. Статусы ритуалов уйдут, когда появится почта."
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    const from =
      process.env.SMTP_FROM?.trim() ||
      process.env.SMTP_USER?.trim() ||
      "Велес <noreply@localhost>";

    if (!this.transporter) {
      this.logger.log(`[email:log] to=${to} subject=${subject}\n${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from, to, subject, text });
    } catch (error) {
      this.logger.error(
        `Не удалось отправить письмо на ${to}: ${
          error instanceof Error ? error.message : "ошибка"
        }`
      );
    }
  }
}
