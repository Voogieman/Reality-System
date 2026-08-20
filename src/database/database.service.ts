import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, MoreThan, Repository } from "typeorm";
import {
  EmailConfirmationTokenEntity,
  OracleMessageEntity,
  RitualHistoryEntity,
  RitualTypeEntity,
  type RitualModerationStatus,
  SessionEntity,
  SupportTicketEntity,
  type SupportTicketStatus,
  UserEntity,
} from "./entities";
import { RITUAL_TYPE_SEEDS } from "./ritual-type.seed";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  emailConfirmed: boolean;
  telegramId: string | null;
  telegramChatId: string | null;
  telegramUsername: string | null;
  telegramLinkToken: string | null;
  preferredGodId: string | null;
  communicationStyle: string | null;
  situationNeed: string | null;
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
  moderationStatus: RitualModerationStatus;
  moderationEtaMinutes: number;
  moderationReason: string | null;
  moderatedAt: Date | null;
  completedAt: Date | null;
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
  sessionId: string | null;
  communicationStyle: string | null;
  emotion: string | null;
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
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(EmailConfirmationTokenEntity)
    private readonly emailTokenRepo: Repository<EmailConfirmationTokenEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
    @InjectRepository(RitualTypeEntity)
    private readonly ritualTypeRepo: Repository<RitualTypeEntity>,
    @InjectRepository(RitualHistoryEntity)
    private readonly ritualHistoryRepo: Repository<RitualHistoryEntity>,
    @InjectRepository(OracleMessageEntity)
    private readonly oracleMessageRepo: Repository<OracleMessageEntity>,
    @InjectRepository(SupportTicketEntity)
    private readonly supportTicketRepo: Repository<SupportTicketEntity>
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.isAvailable()) {
      this.logger.warn(
        "PostgreSQL is not connected. Persistence-dependent features are unavailable."
      );
      return;
    }

    await this.seedRitualTypes();
    this.logger.log("PostgreSQL/TypeORM connected. Persistence is enabled.");
  }

  isAvailable(): boolean {
    return this.dataSource?.isInitialized ?? false;
  }

  private async seedRitualTypes(): Promise<void> {
    for (const seed of RITUAL_TYPE_SEEDS) {
      const existing = await this.ritualTypeRepo.findOne({
        where: { slug: seed.slug },
      });
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

  async getUserByTelegramId(telegramId: string): Promise<UserRecord | null> {
    const row = await this.userRepo.findOne({ where: { telegramId } });
    return row ? this.mapUser(row) : null;
  }

  async getUserByTelegramLinkToken(token: string): Promise<UserRecord | null> {
    const row = await this.userRepo.findOne({ where: { telegramLinkToken: token } });
    return row ? this.mapUser(row) : null;
  }

  async updateUser(
    userId: string,
    patch: Partial<
      Pick<
        UserRecord,
        | "telegramId"
        | "telegramChatId"
        | "telegramUsername"
        | "telegramLinkToken"
        | "preferredGodId"
        | "communicationStyle"
        | "situationNeed"
        | "emailConfirmed"
        | "displayName"
      >
    >
  ): Promise<void> {
    await this.userRepo.update({ id: userId }, patch);
  }

  async getOracleMessageById(id: string): Promise<OracleMessageRecord | null> {
    const row = await this.oracleMessageRepo.findOne({ where: { id } });
    return row ? this.mapOracleMessage(row) : null;
  }

  async updateOracleMessage(
    id: string,
    patch: Partial<Pick<OracleMessageRecord, "emotion" | "sessionId" | "communicationStyle">>
  ): Promise<void> {
    await this.oracleMessageRepo.update({ id }, patch);
  }

  async getUserById(userId: string): Promise<UserRecord | null> {
    const row = await this.userRepo.findOne({ where: { id: userId } });
    return row ? this.mapUser(row) : null;
  }

  async createUser(
    input: Pick<UserRecord, "id" | "email" | "passwordHash" | "displayName" | "emailConfirmed"> &
      Partial<UserRecord>
  ): Promise<void> {
    await this.userRepo.save({
      id: input.id,
      email: input.email,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      emailConfirmed: input.emailConfirmed,
      telegramId: input.telegramId ?? null,
      telegramChatId: input.telegramChatId ?? null,
      telegramUsername: input.telegramUsername ?? null,
      telegramLinkToken: input.telegramLinkToken ?? null,
      preferredGodId: input.preferredGodId ?? null,
      communicationStyle: input.communicationStyle ?? null,
      situationNeed: input.situationNeed ?? null,
    });
  }

  async saveEmailConfirmationToken(
    input: Omit<EmailConfirmationTokenRecord, "createdAt" | "usedAt">
  ): Promise<void> {
    await this.emailTokenRepo.save({
      token: input.token,
      userId: input.userId,
      expiresAt: input.expiresAt,
      usedAt: null,
    });
  }

  async getEmailConfirmationToken(
    token: string
  ): Promise<EmailConfirmationTokenRecord | null> {
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

  async createSession(input: Omit<SessionRecord, "createdAt">): Promise<void> {
    await this.sessionRepo.save({
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  }

  async getSessionByTokenHash(
    tokenHash: string
  ): Promise<SessionRecord | null> {
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
    moderationStatus: RitualModerationStatus;
    moderationEtaMinutes: number;
    moderationReason: string | null;
    moderatedAt?: Date | null;
    completedAt?: Date | null;
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
      moderationStatus: input.moderationStatus,
      moderationEtaMinutes: input.moderationEtaMinutes,
      moderationReason: input.moderationReason,
      moderatedAt: input.moderatedAt ?? null,
      completedAt: input.completedAt ?? null,
      success: input.success,
      result: input.result,
    });
  }

  async getRitualHistoryById(
    ritualId: string
  ): Promise<RitualHistoryRecord | null> {
    const row = await this.ritualHistoryRepo.findOne({
      where: { id: ritualId },
      relations: ["ritualType"],
    });
    return row ? this.mapRitualHistory(row) : null;
  }

  async updateRitualModeration(
    ritualId: string,
    patch: {
      moderationStatus: RitualModerationStatus;
      moderationReason?: string | null;
      success?: boolean;
      result?: Record<string, unknown>;
      moderatedAt?: Date | null;
      completedAt?: Date | null;
    }
  ): Promise<void> {
    await this.ritualHistoryRepo.update(
      { id: ritualId },
      {
        moderationStatus: patch.moderationStatus,
        moderationReason: patch.moderationReason ?? null,
        success: patch.success,
        result: patch.result,
        moderatedAt: patch.moderatedAt ?? null,
        completedAt: patch.completedAt ?? null,
      }
    );
  }

  async getRitualHistoryByUserId(
    userId: string,
    limit = 50
  ): Promise<RitualHistoryRecord[]> {
    const rows = await this.ritualHistoryRepo.find({
      where: { userId },
      relations: ["ritualType"],
      order: { createdAt: "DESC" },
      take: limit,
    });

    return rows.map((row) => this.mapRitualHistory(row));
  }

  async saveOracleMessage(input: {
    id: string;
    userId: string | null;
    godId: string;
    intention: string;
    offering: Record<string, unknown> | null;
    prophecy: string;
    model: string;
    sessionId?: string | null;
    communicationStyle?: string | null;
  }): Promise<void> {
    await this.oracleMessageRepo.save({
      id: input.id,
      userId: input.userId,
      godId: input.godId,
      intention: input.intention,
      offering: input.offering,
      prophecy: input.prophecy,
      model: input.model,
      sessionId: input.sessionId ?? null,
      communicationStyle: input.communicationStyle ?? null,
      emotion: null,
    });
  }

  async getOracleHistoryByUserId(
    userId: string,
    limit = 50
  ): Promise<OracleMessageRecord[]> {
    const rows = await this.oracleMessageRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
    });

    return rows.map((row) => this.mapOracleMessage(row));
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
      status: input.status ?? "new",
      moderatorReply: input.moderatorReply ?? null,
    });

    return this.mapSupportTicket(row);
  }

  async getSupportTicketsByUserId(
    userId: string,
    limit = 50
  ): Promise<SupportTicketRecord[]> {
    const rows = await this.supportTicketRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
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
      telegramId: row.telegramId ?? null,
      telegramChatId: row.telegramChatId ?? null,
      telegramUsername: row.telegramUsername ?? null,
      telegramLinkToken: row.telegramLinkToken ?? null,
      preferredGodId: row.preferredGodId ?? null,
      communicationStyle: row.communicationStyle ?? null,
      situationNeed: row.situationNeed ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapOracleMessage(row: OracleMessageEntity): OracleMessageRecord {
    return {
      id: row.id,
      userId: row.userId,
      godId: row.godId,
      intention: row.intention,
      offering: row.offering,
      prophecy: row.prophecy,
      model: row.model,
      sessionId: row.sessionId ?? null,
      communicationStyle: row.communicationStyle ?? null,
      emotion: row.emotion ?? null,
      createdAt: row.createdAt,
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

  private mapRitualHistory(row: RitualHistoryEntity): RitualHistoryRecord {
    const moderationStatus =
      row.moderationStatus ??
      (row.success ? "completed" : "submitted_for_review");
    const resultGodId =
      row.result && typeof row.result["godId"] === "string"
        ? (row.result["godId"] as string)
        : null;
    const normalizedGodId = row.godId ?? resultGodId ?? "veles";

    return {
      id: row.id,
      userId: row.userId,
      ritualTypeId: row.ritualTypeId,
      godId: normalizedGodId,
      ritualSlug: row.ritualType.slug,
      ritualName: row.ritualType.name,
      person: row.person,
      location: row.location,
      intensity: row.intensity,
      moderationStatus,
      moderationEtaMinutes: row.moderationEtaMinutes ?? 45,
      moderationReason: row.moderationReason ?? null,
      moderatedAt: row.moderatedAt ?? null,
      completedAt: row.completedAt ?? null,
      success: row.success,
      result: row.result,
      createdAt: row.createdAt,
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
