import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PerformRitualDto } from '../reality/dto/perform-ritual.dto';
import { DatabaseService } from '../database/database.service';
import { SLAVIC_GODS } from '../gods/slavic-gods.constants';

@Injectable()
export class RitualsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getRitualTypes() {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        const types = await this.databaseService.getAllRitualTypes();
        return types.map((type) => ({
            slug: type.slug,
            name: type.name,
            type: type.type,
            requiredComponents: type.requiredComponents,
            energyCost: type.energyCost,
            duration: type.duration,
            successRate: type.successRate,
        }));
    }

    async getRitualHistory(userId: string) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        return this.databaseService.getRitualHistoryByUserId(userId);
    }

    async performRitual(ritualDto: PerformRitualDto) {
        if (!this.databaseService.isAvailable()) {
            throw new ServiceUnavailableException('База данных недоступна');
        }

        const { ritualType, location, intensity, person, godName } = ritualDto;
        const invokerId = ritualDto.invokerId;
        if (!invokerId) {
            throw new BadRequestException('Укажите invokerId или авторизуйтесь по JWT');
        }
        const chosenGod = SLAVIC_GODS[godName];
        if (!chosenGod) {
            throw new NotFoundException(`Бог "${godName}" не найден в пантеоне`);
        }

        const ritualTemplate = await this.databaseService.getRitualTypeBySlug(ritualType);

        if (!ritualTemplate) {
            throw new NotFoundException(`Ритуал типа "${ritualType}" не найден`);
        }

        if (intensity > 100 || intensity < 1) {
            throw new BadRequestException('Интенсивность ритуала должна быть от 1 до 100');
        }

        const ritualResult = this.executeRitual(ritualTemplate, ritualDto);
        const recordId = `ritual_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

        await this.databaseService.saveRitualHistory({
            id: recordId,
            userId: invokerId,
            ritualTypeId: ritualTemplate.id,
            godId: godName,
            person,
            location,
            intensity,
            success: ritualResult.success,
            result: ritualResult,
        });

        return {
            id: recordId,
            ...ritualResult,
            godId: godName,
            godName: chosenGod.name,
            location,
            invokerId,
            person,
            timestamp: new Date().toISOString(),
            advice: this.getRitualAdvice(ritualType, ritualResult.success),
        };
    }

    private executeRitual(
        template: {
            name: string;
            energyCost: number;
            duration: string;
            successRate: number;
        },
        ritualDto: PerformRitualDto,
    ) {
        const { intensity } = ritualDto;
        const baseSuccessRate = template.successRate;
        const intensityBonus = intensity * 0.2;
        const totalSuccessRate = Math.min(95, baseSuccessRate + intensityBonus);
        const success = Math.random() * 100 <= totalSuccessRate;

        return {
            success,
            ritualName: template.name,
            energyCost: template.energyCost,
            actualCost: this.calculateActualEnergyCost(template.energyCost, intensity),
            successRate: Math.round(totalSuccessRate),
            duration: template.duration,
            powerLevel: this.calculatePowerLevel(intensity, success),
            message: success ? this.getSuccessMessage(template.name) : this.getFailureMessage(template.name),
        };
    }

    private calculateActualEnergyCost(baseCost: number, intensity: number): number {
        return Math.round(baseCost * (intensity / 50));
    }

    private calculatePowerLevel(intensity: number, success: boolean): string {
        if (!success) return 'НУЛЕВОЙ';
        if (intensity > 90) return 'ЛЕГЕНДАРНЫЙ';
        if (intensity > 75) return 'ЭПИЧЕСКИЙ';
        if (intensity > 60) return 'ВЫСОКИЙ';
        if (intensity > 40) return 'СРЕДНИЙ';
        return 'НИЗКИЙ';
    }

    private getSuccessMessage(ritualName: string): string {
        const messages: Record<string, string> = {
            Очищение: 'Место очищено. Свет изгнал тьму!',
            Благословение: 'Боги благословили это место!',
            Освящение: 'Святость наполнила пространство!',
            Тканье: 'Тени подчинились твоей воле!',
            Соитие: 'Силы соединились в гармонии!',
            Предложение: 'Договор заключён!',
        };
        return messages[ritualName] || 'Ритуал завершён успешно!';
    }

    private getFailureMessage(ritualName: string): string {
        const messages: Record<string, string> = {
            Очищение: 'Очищение не удалось. Тьма сопротивляется!',
            Благословение: 'Боги не услышали твои молитвы!',
            Освящение: 'Святость не снизошла на это место!',
            Тканье: 'Тени вышли из-под контроля!',
            Соитие: 'Ритуал не удался!',
            Предложение: 'Соглашение не состоялось!',
        };
        return messages[ritualName] || 'Ритуал провалился!';
    }

    private getRitualAdvice(ritualType: string, success: boolean): string {
        if (success) {
            const advice: Record<string, string> = {
                purification: 'Поддерживайте чистоту регулярными малыми ритуалами.',
                blessing: 'Благословение будет сильнее при чистоте помыслов.',
                consecration: 'Освящённое место требует уважения и заботы.',
                weaving: 'Помните: тени должны служить, а не управлять.',
                coition: 'Используйте этот ритуал осознанно и с ответственностью.',
                offer: 'Перед заключением соглашений проверяйте свои намерения.',
            };
            return advice[ritualType] || 'Продолжайте в том же духе!';
        }

        return 'Отдохните и попробуйте снова после восстановления энергии.';
    }
}
