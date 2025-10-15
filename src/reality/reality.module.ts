import { Module } from '@nestjs/common';
import { RealityController } from './reality.controller';
import { RealityService } from './reality.service';
import { BloodlineService } from '../bloodline/bloodline.service';
import { BalanceService } from '../balance/balance.service';
import { RitualsService } from '../rituals/rituals.service';
import {GodsService} from "../goods/gods.service";

@Module({
    controllers: [RealityController],
    providers: [RealityService, BloodlineService, GodsService, BalanceService, RitualsService],
    exports: [RealityService],
})
export class RealityModule {}