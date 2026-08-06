import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("sessions")
export class SessionEntity {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ name: "user_id", length: 64 })
  userId: string;

  @Column({ name: "token_hash", length: 128 })
  tokenHash: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
