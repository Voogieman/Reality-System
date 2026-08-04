import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('oracle_messages')
export class OracleMessageEntity {
    @PrimaryColumn({ length: 64 })
    id: string;

    @Column({ name: 'user_id', length: 64, nullable: true })
    userId: string | null;

    @Column({ name: 'god_id', length: 64 })
    godId: string;

    @Column({ type: 'text' })
    intention: string;

    @Column({ type: 'jsonb', nullable: true })
    offering: Record<string, unknown> | null;

    @Column({ type: 'text' })
    prophecy: string;

    @Column({ length: 128 })
    model: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
