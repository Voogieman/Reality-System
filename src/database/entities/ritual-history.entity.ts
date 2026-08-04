import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { RitualTypeEntity } from './ritual-type.entity';

@Entity('ritual_history')
export class RitualHistoryEntity {
    @PrimaryColumn({ length: 64 })
    id: string;

    @Column({ name: 'user_id', length: 64 })
    userId: string;

    @Column({ name: 'ritual_type_id', length: 64 })
    ritualTypeId: string;

    @Column({ name: 'god_id', length: 64, type: 'varchar', nullable: true })
    godId: string | null;

    @ManyToOne(() => RitualTypeEntity, (type) => type.history, { eager: true })
    @JoinColumn({ name: 'ritual_type_id' })
    ritualType: RitualTypeEntity;

    @Column({ length: 255 })
    person: string;

    @Column({ length: 512 })
    location: string;

    @Column({ type: 'int' })
    intensity: number;

    @Column({ default: false })
    success: boolean;

    @Column({ type: 'jsonb' })
    result: Record<string, unknown>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
