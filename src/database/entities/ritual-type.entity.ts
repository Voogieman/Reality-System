import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { RitualHistoryEntity } from './ritual-history.entity';

@Entity('ritual_types')
export class RitualTypeEntity {
    @PrimaryColumn({ length: 64 })
    id: string;

    @Column({ length: 64, unique: true })
    slug: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 64 })
    type: string;

    @Column({ name: 'energy_cost', type: 'int' })
    energyCost: number;

    @Column({ length: 128 })
    duration: string;

    @Column({ name: 'success_rate', type: 'int' })
    successRate: number;

    @Column({ name: 'required_components', type: 'jsonb' })
    requiredComponents: string[];

    @OneToMany(() => RitualHistoryEntity, (history) => history.ritualType)
    history: RitualHistoryEntity[];
}
