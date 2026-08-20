import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: "password_hash", length: 255 })
  passwordHash: string;

  @Column({ name: "display_name", length: 255 })
  displayName: string;

  @Column({ name: "email_confirmed", default: false })
  emailConfirmed: boolean;

  @Column({ name: "telegram_id", length: 64, nullable: true, unique: true })
  telegramId: string | null;

  @Column({ name: "telegram_chat_id", length: 64, nullable: true })
  telegramChatId: string | null;

  @Column({ name: "telegram_username", length: 128, nullable: true })
  telegramUsername: string | null;

  @Column({ name: "telegram_link_token", length: 128, nullable: true })
  telegramLinkToken: string | null;

  @Column({ name: "preferred_god_id", length: 64, nullable: true })
  preferredGodId: string | null;

  @Column({ name: "communication_style", length: 32, nullable: true })
  communicationStyle: string | null;

  @Column({ name: "situation_need", length: 64, nullable: true })
  situationNeed: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
