import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { RitualTypeEntity } from "./ritual-type.entity";

export type RitualModerationStatus =
  | "submitted_for_review"
  | "accepted_for_execution"
  | "rejected"
  | "completed";

@Entity("ritual_history")
export class RitualHistoryEntity {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ name: "user_id", length: 64 })
  userId: string;

  @Column({ name: "ritual_type_id", length: 64 })
  ritualTypeId: string;

  @Column({ name: "god_id", length: 64, type: "varchar", nullable: true })
  godId: string | null;

  @ManyToOne(() => RitualTypeEntity, (type) => type.history, { eager: true })
  @JoinColumn({ name: "ritual_type_id" })
  ritualType: RitualTypeEntity;

  @Column({ length: 255 })
  person: string;

  @Column({ length: 512 })
  location: string;

  @Column({ type: "int" })
  intensity: number;

  @Column({
    name: "moderation_status",
    length: 32,
    type: "varchar",
    nullable: true,
  })
  moderationStatus: RitualModerationStatus | null;

  @Column({ name: "moderation_eta_minutes", type: "int", nullable: true })
  moderationEtaMinutes: number | null;

  @Column({ name: "moderation_reason", type: "text", nullable: true })
  moderationReason: string | null;

  @Column({ name: "moderated_at", type: "timestamptz", nullable: true })
  moderatedAt: Date | null;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt: Date | null;

  @Column({ default: false })
  success: boolean;

  @Column({ type: "jsonb" })
  result: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
