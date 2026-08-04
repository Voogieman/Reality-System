import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('email_confirmation_tokens')
export class EmailConfirmationTokenEntity {
    @PrimaryColumn({ length: 128 })
    token: string;

    @Column({ name: 'user_id', length: 64 })
    userId: string;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
    usedAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
