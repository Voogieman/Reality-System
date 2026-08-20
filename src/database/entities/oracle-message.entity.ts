import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("oracle_messages")
export class OracleMessageEntity {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ name: "user_id", length: 64, nullable: true })
  userId: string | null;

  @Column({ name: "god_id", length: 64 })
  godId: string;

  @Column({ type: "text" })
  intention: string;

  @Column({ type: "jsonb", nullable: true })
  offering: Record<string, unknown> | null;

  @Column({ type: "text" })
  prophecy: string;

  @Column({ length: 128 })
  model: string;

  @Column({ name: "session_id", length: 64, nullable: true })
  sessionId: string | null;

  @Column({ name: "communication_style", length: 32, nullable: true })
  communicationStyle: string | null;

  @Column({ length: 32, nullable: true })
  emotion: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
