import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { RitualsService } from '../rituals/rituals.service';
import { PerformRitualDto } from './dto/perform-ritual.dto';
import { GodsService } from '../gods/gods.service';
import { DatabaseService } from '../database/database.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { GodOracleService } from '../ai/god-oracle.service';
import { GodOracleDto } from './dto/god-oracle.dto';
import { AiConfigService } from '../ai/ai-config.service';
import { LoginDto } from './dto/login.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { AuthUser, JwtPayload } from '../auth/jwt-payload.interface';

@Injectable()
export class RealityService {
    private readonly logger = new Logger(RealityService.name);
    private readonly sessionTtlMs = 7 * 24 * 60 * 60 * 1000;

    constructor(
        private readonly godsService: GodsService,
        private readonly ritualsService: RitualsService,
        private readonly databaseService: DatabaseService,
        private readonly godOracle: GodOracleService,
        private readonly aiConfig: AiConfigService,
        private readonly jwtService: JwtService,
    ) {}

    listGods() {
        return {
            success: true,
            count: this.godsService.getAllGods().length,
            data: this.godsService.getAllGods(),
            aiOracleEnabled: this.aiConfig.enabled,
            timestamp: new Date().toISOString(),
        };
    }

    async askOracle(dto: GodOracleDto, authUser?: AuthUser) {
        const userId = authUser?.userId ?? dto.userId;
        const oracle = await this.godOracle.speak({
            godName: dto.godName,
            intention: dto.intention,
            userId,
            offeringType: dto.offering?.type,
            purity: dto.offering?.purity,
            significance: dto.offering?.significance,
        });

        const god = this.godsService.getGodById(dto.godName);

        return {
            success: true,
            message: `${god.name} отвечает страннику`,
            data: {
                god: god.name,
                godId: dto.godName,
                oracle,
            },
            timestamp: new Date().toISOString(),
        };
    }

    async getOracleHistory(userId: string) {
        const history = await this.godOracle.getHistory(userId);

        return {
            success: true,
            count: history.length,
            data: history,
            timestamp: new Date().toISOString(),
        };
    }

    async getRitualTypes() {
        const types = await this.ritualsService.getRitualTypes();

        return {
            success: true,
            count: types.length,
            data: types,
            timestamp: new Date().toISOString(),
        };
    }

    async getRitualHistory(userId: string) {
        const history = await this.ritualsService.getRitualHistory(userId);

        return {
            success: true,
            count: history.length,
            data: history,
            timestamp: new Date().toISOString(),
        };
    }

    async performRitual(ritualDto: PerformRitualDto, authUser?: AuthUser) {
        const invokerId = authUser?.userId ?? ritualDto.invokerId;
        if (!invokerId) {
            throw new BadRequestException('Укажите invokerId или авторизуйтесь по JWT');
        }

        const payload: PerformRitualDto = {
            ...ritualDto,
            invokerId,
        };
        const ritual = await this.ritualsService.performRitual(payload);

        return {
            success: true,
            message: `Ритуал "${ritualDto.ritualType}" успешно выполнен`,
            data: ritual,
            effect: 'Силы природы отвечают на твой зов.',
            timestamp: new Date().toISOString(),
        };
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна. Регистрация временно невозможна');
        }

        const normalizedEmail = registerUserDto.email.trim().toLowerCase();
        const existingUser = await this.databaseService.getUserByEmail(normalizedEmail);
        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const passwordHash = this.hashPassword(registerUserDto.password);
        await this.databaseService.createUser({
            id: userId,
            email: normalizedEmail,
            passwordHash,
            displayName: registerUserDto.displayName.trim(),
            emailConfirmed: false,
        });

        const confirmationToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.databaseService.saveEmailConfirmationToken({
            token: confirmationToken,
            userId,
            expiresAt,
        });

        const appBaseUrl = (process.env.APP_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
        const confirmationUrl = `${appBaseUrl}/reality/auth/confirm-email?token=${confirmationToken}`;
        this.logger.log(`Email confirmation link for ${normalizedEmail}: ${confirmationUrl}`);

        return {
            success: true,
            message: 'Пользователь зарегистрирован. Подтвердите email по ссылке из письма.',
            data: {
                userId,
                email: normalizedEmail,
                emailConfirmed: false,
                confirmationUrl,
            },
            timestamp: new Date().toISOString(),
        };
    }

    async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна. Подтверждение email временно невозможно');
        }

        const tokenData = await this.databaseService.getEmailConfirmationToken(confirmEmailDto.token);
        if (!tokenData) {
            throw new BadRequestException('Недействительный токен подтверждения');
        }
        if (tokenData.usedAt) {
            throw new BadRequestException('Токен уже был использован');
        }
        if (tokenData.expiresAt.getTime() < Date.now()) {
            throw new BadRequestException('Срок действия токена истёк');
        }

        await this.databaseService.markEmailConfirmed(tokenData.userId);
        await this.databaseService.markEmailConfirmationTokenUsed(tokenData.token);

        return {
            success: true,
            message: 'Email успешно подтверждён',
            data: {
                userId: tokenData.userId,
                emailConfirmed: true,
            },
            timestamp: new Date().toISOString(),
        };
    }

    async login(loginDto: LoginDto) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна. Вход временно невозможен');
        }

        const normalizedEmail = loginDto.email.trim().toLowerCase();
        const user = await this.databaseService.getUserByEmail(normalizedEmail);

        if (!user || !this.verifyPassword(loginDto.password, user.passwordHash)) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        if (!user.emailConfirmed) {
            throw new UnauthorizedException('Подтвердите email перед входом');
        }

        const sessionId = `sess_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const expiresAt = new Date(Date.now() + this.sessionTtlMs);
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            displayName: user.displayName,
            sid: sessionId,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        await this.databaseService.createSession({
            id: sessionId,
            userId: user.id,
            tokenHash: this.hashSessionToken(accessToken),
            expiresAt,
        });

        return {
            success: true,
            message: 'Вход выполнен',
            data: {
                accessToken,
                tokenType: 'Bearer',
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                },
            },
            timestamp: new Date().toISOString(),
        };
    }

    async logout(authUser: AuthUser) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        await this.databaseService.deleteSession(authUser.sessionId);

        return {
            success: true,
            message: 'Сессия завершена',
            timestamp: new Date().toISOString(),
        };
    }

    async getCurrentUser(authUser: AuthUser) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        const user = await this.databaseService.getUserById(authUser.userId);
        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }

        return {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                emailConfirmed: user.emailConfirmed,
            },
            timestamp: new Date().toISOString(),
        };
    }

    async createSupportTicket(dto: CreateSupportTicketDto, authUser?: AuthUser) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        let email = dto.email?.trim().toLowerCase();
        let displayName = dto.displayName?.trim();

        if (authUser) {
            const user = await this.databaseService.getUserById(authUser.userId);
            if (!user) {
                throw new UnauthorizedException('Пользователь не найден');
            }
            email = user.email;
            displayName = user.displayName;
        }

        if (!email || !displayName) {
            throw new BadRequestException('Укажите email и имя или авторизуйтесь');
        }

        const ticket = await this.databaseService.createSupportTicket({
            id: `sup_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            userId: authUser?.userId ?? null,
            email,
            displayName,
            subject: dto.subject.trim(),
            message: dto.message.trim(),
            status: 'new',
            moderatorReply:
                'Обращение принято. Модератор круга свяжется с тобой, когда прочитает послание.',
        });

        return {
            success: true,
            message: 'Обращение отправлено модератору',
            data: ticket,
            timestamp: new Date().toISOString(),
        };
    }

    async getSupportTickets(userId: string) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        const tickets = await this.databaseService.getSupportTicketsByUserId(userId);

        return {
            success: true,
            count: tickets.length,
            data: tickets,
            timestamp: new Date().toISOString(),
        };
    }

    private hashPassword(password: string): string {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${derivedKey}`;
    }

    private verifyPassword(password: string, storedHash: string): boolean {
        const [salt, key] = storedHash.split(':');
        if (!salt || !key) {
            return false;
        }

        const derivedKey = scryptSync(password, salt, 64).toString('hex');
        const keyBuffer = Buffer.from(key, 'hex');
        const derivedBuffer = Buffer.from(derivedKey, 'hex');

        if (keyBuffer.length !== derivedBuffer.length) {
            return false;
        }

        return timingSafeEqual(keyBuffer, derivedBuffer);
    }

    private hashSessionToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
