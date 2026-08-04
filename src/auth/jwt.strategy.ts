import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database/database.service';
import { AuthUser, JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly databaseService: DatabaseService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'magic13-dev-jwt-secret-change-me',
        });
    }

    async validate(payload: JwtPayload): Promise<AuthUser> {
        if (!payload?.sub || !payload?.sid) {
            throw new UnauthorizedException('Недействительный JWT-токен');
        }

        if (!this.databaseService.isAvailable()) {
            throw new UnauthorizedException('База данных недоступна');
        }

        const session = await this.databaseService.getSessionById(payload.sid);
        if (!session || session.userId !== payload.sub) {
            throw new UnauthorizedException('Сессия недействительна или истекла');
        }

        if (session.expiresAt.getTime() < Date.now()) {
            await this.databaseService.deleteSession(session.id);
            throw new UnauthorizedException('Срок действия сессии истёк');
        }

        const user = await this.databaseService.getUserById(payload.sub);
        if (!user || !user.emailConfirmed) {
            throw new UnauthorizedException('Пользователь не найден или email не подтверждён');
        }

        return {
            userId: user.id,
            email: user.email,
            displayName: user.displayName,
            sessionId: session.id,
        };
    }
}
