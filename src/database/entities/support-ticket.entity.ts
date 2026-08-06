import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export type SupportTicketStatus = "new" | "in_review" | "answered" | "closed";

@Entity("support_tickets")
export class SupportTicketEntity {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ name: "user_id", length: 64, nullable: true, type: "varchar" })
  userId: string | null;

  @Column({ length: 255 })
  email: string;

  @Column({ name: "display_name", length: 255 })
  displayName: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: "text" })
  message: string;

  @Column({ length: 32, default: "new" })
  status: SupportTicketStatus;

  @Column({ name: "moderator_reply", type: "text", nullable: true })
  moderatorReply: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
