import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import {
    EmailConfirmationTokenEntity,
    OracleMessageEntity,
    RitualHistoryEntity,
    RitualTypeEntity,
    SessionEntity,
    SupportTicketEntity,
    type SupportTicketStatus,
    UserEntity,
} from './entities';
import { RITUAL_TYPE_SEEDS } from './ritual-type.seed';

export interface UserRecord {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    emailConfirmed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailConfirmationTokenRecord {
    token: string;
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}

export interface SessionRecord {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}

export interface RitualTypeRecord {
    id: string;
    slug: string;
    name: string;
    type: string;
    energyCost: number;
    duration: string;
    successRate: number;
    requiredComponents: string[];
}

export interface RitualHistoryRecord {
    id: string;
    userId: string;
    ritualTypeId: string;
    godId: string | null;
    ritualSlug: string;
    ritualName: string;
    person: string;
    location: string;
    intensity: number;
    success: boolean;
    result: Record<string, unknown>;
    createdAt: Date;
}

export interface OracleMessageRecord {
    id: string;
    userId: string | null;
    godId: string;
    intention: string;
    offering: Record<string, unknown> | null;
    prophecy: string;
    model: string;
    createdAt: Date;
}

export interface SupportTicketRecord {
    id: string;
    userId: string | null;
    email: string;
    displayName: string;
    subject: string;
    message: string;
    status: SupportTicketStatus;
    moderatorReply: string | null;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(EmailConfirmationTokenEntity)
        private readonly emailTokenRepo: Repository<EmailConfirmationTokenEntity>,
        @InjectRepository(SessionEntity) private readonly sessionRepo: Repository<SessionEntity>,
        @InjectRepository(RitualTypeEntity) private readonly ritualTypeRepo: Repository<RitualTypeEntity>,
        @InjectRepository(RitualHistoryEntity)
        private readonly ritualHistoryRepo: Repository<RitualHistoryEntity>,
        @InjectRepository(OracleMessageEntity)
        private readonly oracleMessageRepo: Repository<OracleMessageEntity>,
        @InjectRepository(SupportTicketEntity)
        private readonly supportTicketRepo: Repository<SupportTicketEntity>,
    ) {}

    async onModuleInit(): Promise<void> {
        if (!this.isAvailable()) {
            this.logger.warn('PostgreSQL is not connected. Persistence-dependent features are unavailable.');
            return;
        }

        await this.seedRitualTypes();
        this.logger.log('PostgreSQL/TypeORM connected. Persistence is enabled.');
    }

    isAvailable(): boolean {
        return this.dataSource?.isInitialized ?? false;
    }

    private async seedRitualTypes(): Promise<void> {
        for (const seed of RITUAL_TYPE_SEEDS) {
            const existing = await this.ritualTypeRepo.findOne({ where: { slug: seed.slug } });
            if (existing) {
                continue;
            }

            await this.ritualTypeRepo.save({
                id: `ritual_type_${seed.slug}`,
                slug: seed.slug,
                name: seed.name,
                type: seed.type,
                energyCost: seed.energyCost,
                duration: seed.duration,
                successRate: seed.successRate,
                requiredComponents: [...seed.requiredComponents],
            });
        }
    }

    async getUserByEmail(email: string): Promise<UserRecord | null> {
        const row = await this.userRepo.findOne({ where: { email } });
        return row ? this.mapUser(row) : null;
    }

    async getUserById(userId: string): Promise<UserRecord | null> {
        const row = await this.userRepo.findOne({ where: { id: userId } });
        return row ? this.mapUser(row) : null;
    }

    async createUser(input: Omit<UserRecord, 'createdAt' | 'updatedAt'>): Promise<void> {
        await this.userRepo.save({
            id: input.id,
            email: input.email,
            passwordHash: input.passwordHash,
            displayName: input.displayName,
            emailConfirmed: input.emailConfirmed,
        });
    }

    async saveEmailConfirmationToken(
        input: Omit<EmailConfirmationTokenRecord, 'createdAt' | 'usedAt'>,
    ): Promise<void> {
        await this.emailTokenRepo.save({
            token: input.token,
            userId: input.userId,
            expiresAt: input.expiresAt,
            usedAt: null,
        });
    }

    async getEmailConfirmationToken(token: string): Promise<EmailConfirmationTokenRecord | null> {
        const row = await this.emailTokenRepo.findOne({ where: { token } });
        if (!row) {
            return null;
        }

        return {
            token: row.token,
            userId: row.userId,
            expiresAt: row.expiresAt,
            usedAt: row.usedAt,
            createdAt: row.createdAt,
        };
    }

    async markEmailConfirmed(userId: string): Promise<void> {
        await this.userRepo.update({ id: userId }, { emailConfirmed: true });
    }

    async markEmailConfirmationTokenUsed(token: string): Promise<void> {
        await this.emailTokenRepo.update({ token }, { usedAt: new Date() });
    }

    async createSession(input: Omit<SessionRecord, 'createdAt'>): Promise<void> {
        await this.sessionRepo.save({
            id: input.id,
            userId: input.userId,
            tokenHash: input.tokenHash,
            expiresAt: input.expiresAt,
        });
    }

    async getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
        const row = await this.sessionRepo.findOne({
            where: {
                tokenHash,
                expiresAt: MoreThan(new Date()),
            },
        });

        if (!row) {
            return null;
        }

        return this.mapSession(row);
    }

    async getSessionById(sessionId: string): Promise<SessionRecord | null> {
        const row = await this.sessionRepo.findOne({ where: { id: sessionId } });
        return row ? this.mapSession(row) : null;
    }

    async deleteSession(sessionId: string): Promise<void> {
        await this.sessionRepo.delete({ id: sessionId });
    }

    private mapSession(row: SessionEntity): SessionRecord {
        return {
            id: row.id,
            userId: row.userId,
            tokenHash: row.tokenHash,
            expiresAt: row.expiresAt,
            createdAt: row.createdAt,
        };
    }

    async getRitualTypeBySlug(slug: string): Promise<RitualTypeRecord | null> {
        const row = await this.ritualTypeRepo.findOne({ where: { slug } });
        return row ? this.mapRitualType(row) : null;
    }

    async getAllRitualTypes(): Promise<RitualTypeRecord[]> {
        const rows = await this.ritualTypeRepo.find();
        return rows.map((row) => this.mapRitualType(row));
    }

    async saveRitualHistory(input: {
        id: string;
        userId: string;
        ritualTypeId: string;
        godId: string;
        person: string;
        location: string;
        intensity: number;
        success: boolean;
        result: Record<string, unknown>;
    }): Promise<void> {
        await this.ritualHistoryRepo.save({
            id: input.id,
            userId: input.userId,
            ritualTypeId: input.ritualTypeId,
            godId: input.godId,
            person: input.person,
            location: input.location,
            intensity: input.intensity,
            success: input.success,
            result: input.result,
        });
    }

    async getRitualHistoryByUserId(userId: string, limit = 50): Promise<RitualHistoryRecord[]> {
        const rows = await this.ritualHistoryRepo.find({
            where: { userId },
            relations: ['ritualType'],
            order: { createdAt: 'DESC' },
            take: limit,
        });

        return rows.map((row) => ({
            id: row.id,
            userId: row.userId,
            ritualTypeId: row.ritualTypeId,
            godId: row.godId ?? null,
            ritualSlug: row.ritualType.slug,
            ritualName: row.ritualType.name,
            person: row.person,
            location: row.location,
            intensity: row.intensity,
            success: row.success,
            result: row.result,
            createdAt: row.createdAt,
        }));
    }

    async saveOracleMessage(input: {
        id: string;
        userId: string | null;
        godId: string;
        intention: string;
        offering: Record<string, unknown> | null;
        prophecy: string;
        model: string;
    }): Promise<void> {
        await this.oracleMessageRepo.save({
            id: input.id,
            userId: input.userId,
            godId: input.godId,
            intention: input.intention,
            offering: input.offering,
            prophecy: input.prophecy,
            model: input.model,
        });
    }

    async getOracleHistoryByUserId(userId: string, limit = 50): Promise<OracleMessageRecord[]> {
        const rows = await this.oracleMessageRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });

        return rows.map((row) => ({
            id: row.id,
            userId: row.userId,
            godId: row.godId,
            intention: row.intention,
            offering: row.offering,
            prophecy: row.prophecy,
            model: row.model,
            createdAt: row.createdAt,
        }));
    }

    async createSupportTicket(input: {
        id: string;
        userId: string | null;
        email: string;
        displayName: string;
        subject: string;
        message: string;
        status?: SupportTicketStatus;
        moderatorReply?: string | null;
    }): Promise<SupportTicketRecord> {
        const row = await this.supportTicketRepo.save({
            id: input.id,
            userId: input.userId,
            email: input.email,
            displayName: input.displayName,
            subject: input.subject,
            message: input.message,
            status: input.status ?? 'new',
            moderatorReply: input.moderatorReply ?? null,
        });

        return this.mapSupportTicket(row);
    }

    async getSupportTicketsByUserId(userId: string, limit = 50): Promise<SupportTicketRecord[]> {
        const rows = await this.supportTicketRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });

        return rows.map((row) => this.mapSupportTicket(row));
    }

    private mapUser(row: UserEntity): UserRecord {
        return {
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            displayName: row.displayName,
            emailConfirmed: row.emailConfirmed,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }

    private mapSupportTicket(row: SupportTicketEntity): SupportTicketRecord {
        return {
            id: row.id,
            userId: row.userId,
            email: row.email,
            displayName: row.displayName,
            subject: row.subject,
            message: row.message,
            status: row.status,
            moderatorReply: row.moderatorReply,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }

    private mapRitualType(row: RitualTypeEntity): RitualTypeRecord {
        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            type: row.type,
            energyCost: row.energyCost,
            duration: row.duration,
            successRate: row.successRate,
            requiredComponents: row.requiredComponents,
        };
    }
}
