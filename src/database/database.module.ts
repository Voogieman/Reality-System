import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { buildTypeOrmConfig } from './typeorm.config';
import {
    EmailConfirmationTokenEntity,
    OracleMessageEntity,
    RitualHistoryEntity,
    RitualTypeEntity,
    SessionEntity,
    SupportTicketEntity,
    UserEntity,
} from './entities';

@Module({
    imports: [
        TypeOrmModule.forRoot(buildTypeOrmConfig()),
        TypeOrmModule.forFeature([
            UserEntity,
            EmailConfirmationTokenEntity,
            SessionEntity,
            RitualTypeEntity,
            RitualHistoryEntity,
            OracleMessageEntity,
            SupportTicketEntity,
        ]),
    ],
    providers: [DatabaseService],
    exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
