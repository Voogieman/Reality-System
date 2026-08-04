import { Module } from '@nestjs/common';
import { RealityController } from './reality.controller';
import { RealityService } from './reality.service';
import { RitualsService } from '../rituals/rituals.service';
import { GodsService } from '../gods/gods.service';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AiModule, DatabaseModule, AuthModule],
    controllers: [RealityController],
    providers: [RealityService, GodsService, RitualsService],
    exports: [RealityService],
})
export class RealityModule {}
