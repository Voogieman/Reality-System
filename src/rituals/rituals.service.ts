import { Injectable } from '@nestjs/common';
import { PerformRitualDto } from '../reality/dto/perform-ritual.dto';

@Injectable()
export class RitualsService {
    private ritualHistory = new Map();
    private ritualTemplates = {
        purification: {
            name: 'Очищение',
            type: 'light',
            requiredComponents: ['свечи', 'травы', 'чистая вода'],
            energyCost: 20,
            duration: '30 минут',
            effects: ['очищение энергии', 'защита от тьмы', 'усиление света'],
            successRate: 85
        },
        blessing: {
            name: 'Благословение',
            type: 'light',
            requiredComponents: ['святая вода', 'цветы', 'ладан'],
            energyCost: 15,
            duration: '20 минут',
            effects: ['божественная защита', 'удача', 'исцеление'],
            successRate: 90
        },
        consecration: {
            name: 'Освящение',
            type: 'light',
            requiredComponents: ['иконы', 'молитвы', 'освященная соль'],
            energyCost: 25,
            duration: '45 минут',
            effects: ['освящение места', 'изгнание нечисти', 'создание святилища'],
            successRate: 80
        },
        shadow_weaving: {
            name: 'Тканье Теней',
            type: 'darkness',
            requiredComponents: ['чёрные свечи', 'тени', 'ночные травы'],
            energyCost: 18,
            duration: '25 минут',
            effects: ['усиление тьмы', 'скрытность', 'доступ к Нави'],
            successRate: 75
        },
        chaos_embrace: {
            name: 'Объятие Хаоса',
            type: 'darkness',
            requiredComponents: ['хаотические символы', 'порошок', 'кровь'],
            energyCost: 30,
            duration: '40 минут',
            effects: ['высвобождение хаоса', 'разрушение барьеров', 'трансформация'],
            successRate: 65
        },
        coition: {
            name: 'Соитие',
            type: 'light',
            requiredComponents: ['святая вода', 'цветы'],
            energyCost: 66,
            duration: '20 минут',
            effects: ['божественная защита', 'любовь', 'исцеление'],
            successRate: 90
        },
        offerJob: {
            name: 'Предложение работы',
            type: 'light',
            requiredComponents: ['святая вода'],
            energyCost: 66,
            duration: '20 минут',
            effects: ['божественная защита', 'развитие карьеры', 'рост зарплаты'],
            successRate: 90
        },
    };

    async performRitual(ritualDto: PerformRitualDto) {
        const { ritualType, location, intensity, invokerId } = ritualDto;

        // Проверка существования ритуала
        const ritualTemplate = this.ritualTemplates[ritualType];
        if (!ritualTemplate) {
            throw new Error(`Ритуал типа "${ritualType}" не найден`);
        }

        // Проверка интенсивности
        if (intensity > 100 || intensity < 1) {
            throw new Error('Интенсивность ритуала должна быть от 1 до 100');
        }

        // Выполнение ритуала
        const ritualResult = this.executeRitual(ritualTemplate, ritualDto);

        // Запись в историю
        this.recordRitual(ritualDto, ritualResult);

        return {
            ...ritualResult,
            location,
            invokerId,
            timestamp: new Date().toISOString(),
            advice: this.getRitualAdvice(ritualType, ritualResult.success)
        };
    }

    getRitualHistory(userId: string) {
        const userRituals = Array.from(this.ritualHistory.values())
            .filter(ritual => ritual.invokerId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return {
            total: userRituals.length,
            successful: userRituals.filter(r => r.success).length,
            failed: userRituals.filter(r => !r.success).length,
            lastPerformed: userRituals[0]?.timestamp || 'Никогда',
            rituals: userRituals.slice(0, 10) // Последние 10 ритуалов
        };
    }

    getAllRituals() {
        return Object.entries(this.ritualTemplates).map(([key, template]) => ({
            id: key,
            ...template,
            difficulty: this.calculateDifficulty(template),
            recommendedFor: this.getRecommendedLocations(key)
        }));
    }

    analyzeRitualEffectiveness(location: string) {
        const locationRituals = Array.from(this.ritualHistory.values())
            .filter(ritual => ritual.location === location);

        if (locationRituals.length === 0) {
            return {
                location,
                message: 'В этой локации ритуалы не проводились',
                recommendation: 'Попробуйте провести первый ритуал'
            };
        }

        const successful = locationRituals.filter(r => r.success).length;
        const successRate = (successful / locationRituals.length) * 100;

        const mostEffectiveRitual = this.findMostEffectiveRitual(locationRituals);
        const bestTime = this.findBestTimeForRituals(locationRituals);

        return {
            location,
            totalRituals: locationRituals.length,
            successRate: Math.round(successRate),
            mostEffectiveRitual,
            bestTime,
            energyPattern: this.analyzeEnergyPattern(locationRituals),
            recommendations: this.generateLocationRecommendations(location, successRate)
        };
    }

    private validateComponents(provided: string[], required: string[]): { valid: boolean; missing: string[] } {
        const missing = required.filter(comp => !provided.includes(comp));
        return {
            valid: missing.length === 0,
            missing
        };
    }

    private executeRitual(template: any, ritualDto: PerformRitualDto) {
        const { intensity } = ritualDto;

        // Расчет успешности на основе интенсивности и компонентов
        const baseSuccessRate = template.successRate;
        const intensityBonus = intensity * 0.2;

        const totalSuccessRate = Math.min(95, baseSuccessRate + intensityBonus);
        const success = Math.random() * 100 <= totalSuccessRate;

        // Расчет эффектов
        const effects = success ? this.calculateSuccessfulEffects(template, intensity) : this.calculateFailedEffects(template);

        return {
            success,
            ritualName: template.name,
            energyCost: template.energyCost,
            actualCost: this.calculateActualEnergyCost(template.energyCost, intensity),
            effects,
            successRate: Math.round(totalSuccessRate),
            duration: template.duration,
            powerLevel: this.calculatePowerLevel(intensity, success),
            message: success ? this.getSuccessMessage(template.name) : this.getFailureMessage(template.name)
        };
    }

    private calculateSuccessfulEffects(template: any, intensity: number) {
        const baseEffects = template.effects;
        const amplifiedEffects = baseEffects.map(effect => ({
            name: effect,
            strength: this.calculateEffectStrength(effect, intensity),
            duration: this.calculateEffectDuration(intensity)
        }));

        // Добавление дополнительных эффектов при высокой интенсивности
        if (intensity > 80) {
            amplifiedEffects.push({
                name: 'Божественное Присутствие',
                strength: 'МОГУЩЕСТВЕННОЕ',
                duration: '24 часа'
            });
        }

        if (intensity > 90) {
            amplifiedEffects.push({
                name: 'Пробуждение Реальности',
                strength: 'ЛЕГЕНДАРНОЕ',
                duration: '7 дней'
            });
        }

        return amplifiedEffects;
    }

    private calculateFailedEffects(template: any) {
        const backlashEffects = [
            { name: 'Энергетическое Истощение', severity: 'СРЕДНЕЕ' },
            { name: 'Временная Блокировка', severity: 'ЛЁГКОЕ' },
            { name: 'Привлечение Внимания Тёмных Сил', severity: 'ВЫСОКОЕ' }
        ];

        // Для тёмных ритуалов последствия хуже
        if (template.type === 'darkness') {
            backlashEffects.push(
                { name: 'Коррупция Души', severity: 'ОПАСНОЕ' },
                { name: 'Разрыв с Светом', severity: 'КРИТИЧЕСКОЕ' }
            );
        }

        return backlashEffects;
    }

    private calculateActualEnergyCost(baseCost: number, intensity: number): number {
        return Math.round(baseCost * (intensity / 50)); // Интенсивность влияет на стоимость
    }

    private calculateEffectStrength(effect: string, intensity: number): string {
        const baseStrength = intensity / 25; // 1-4
        const strengthLevels = ['СЛАБОЕ', 'УМЕРЕННОЕ', 'СИЛЬНОЕ', 'МОГУЩЕСТВЕННОЕ'];
        return strengthLevels[Math.min(Math.floor(baseStrength), 3)];
    }

    private calculateEffectDuration(intensity: number): string {
        if (intensity > 90) return '7 дней';
        if (intensity > 70) return '3 дня';
        if (intensity > 50) return '1 день';
        if (intensity > 30) return '12 часов';
        return '6 часов';
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
        const messages = {
            'Очищение': 'Место очищено. Свет изгнал тьму!',
            'Благословение': 'Боги благословили это место!',
            'Освящение': 'Святость наполнила пространство!',
            'Тканье Теней': 'Тени подчинились твоей воле!',
            'Объятие Хаоса': 'Хаос принес обновление!'
        };
        return messages[ritualName] || 'Ритуал завершён успешно!';
    }

    private getFailureMessage(ritualName: string): string {
        const messages = {
            'Очищение': 'Очищение не удалось. Тьма сопротивляется!',
            'Благословение': 'Боги не услышали твои молитвы!',
            'Освящение': 'Святость не снизошла на это место!',
            'Тканье Теней': 'Тени вышли из-под контроля!',
            'Объятие Хаоса': 'Хаос поглотил ритуал!'
        };
        return messages[ritualName] || 'Ритуал провалился!';
    }

    private getRitualAdvice(ritualType: string, success: boolean): string {
        if (success) {
            const advice = {
                purification: 'Поддерживайте чистоту регулярными малыми ритуалами.',
                blessing: 'Благословение будет сильнее при чистоте помыслов.',
                consecration: 'Освящённое место требует уважения и заботы.',
                shadow_weaving: 'Помните: тени должны служить, а не управлять.',
                chaos_embrace: 'Хаос - инструмент, а не хозяин. Используйте мудро.'
            };
            return advice[ritualType] || 'Продолжайте в том же духе!';
        } else {
            return 'Отдохните и попробуйте снова после восстановления энергии.';
        }
    }

    private recordRitual(ritualDto: PerformRitualDto, result: any) {
        const record = {
            id: `ritual_${Date.now()}`,
            ...ritualDto,
            result,
            timestamp: new Date()
        };

        this.ritualHistory.set(record.id, record);
    }

    private calculateDifficulty(template: any): string {
        const factors = template.energyCost + (100 - template.successRate);

        if (factors > 120) return 'ОЧЕНЬ ВЫСОКАЯ';
        if (factors > 90) return 'ВЫСОКАЯ';
        if (factors > 60) return 'СРЕДНЯЯ';
        if (factors > 30) return 'НИЗКАЯ';
        return 'ОЧЕНЬ НИЗКАЯ';
    }

    private getRecommendedLocations(ritualType: string): string[] {
        const recommendations = {
            purification: ['Нижегородский кремль', 'Храмы', 'Чистые источники'],
            blessing: ['Дома', 'Святилища', 'Места силы'],
            consecration: ['Новые поселения', 'Заброшенные места', 'Границы'],
            shadow_weaving: ['Леса ночью', 'Пещеры', 'Старые кладбища'],
            chaos_embrace: ['Пустоши', 'Места битв', 'Разрушенные строения']
        };
        return recommendations[ritualType] || ['Любая локация'];
    }

    private findMostEffectiveRitual(rituals: any[]): string {
        if (rituals.length === 0) return 'Нет данных';

        const ritualSuccess: Record<string, { total: number; successful: number }> = {};
        rituals.forEach(ritual => {
            const type = ritual.ritualType;
            if (!ritualSuccess[type]) {
                ritualSuccess[type] = { total: 0, successful: 0 };
            }
            ritualSuccess[type].total++;
            if (ritual.result.success) {
                ritualSuccess[type].successful++;
            }
        });

        let bestRitual = '';
        let bestRate = 0;

        Object.entries(ritualSuccess).forEach(([ritual, stats]) => {
            const rate = stats.successful / stats.total;
            if (rate > bestRate) {
                bestRate = rate;
                bestRitual = ritual;
            }
        });

        return bestRitual || 'Нет успешных ритуалов';
    }

    private findBestTimeForRituals(rituals: any[]): string {
        if (rituals.length === 0) return 'Нет данных';

        const timeStats: Record<string, { total: number; successful: number }> = {
            morning: { total: 0, successful: 0 },
            day: { total: 0, successful: 0 },
            evening: { total: 0, successful: 0 },
            night: { total: 0, successful: 0 }
        };

        rituals.forEach(ritual => {
            const hour = new Date(ritual.timestamp).getHours();
            let timeOfDay = '';

            if (hour >= 5 && hour < 12) timeOfDay = 'morning';
            else if (hour >= 12 && hour < 17) timeOfDay = 'day';
            else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
            else timeOfDay = 'night';

            timeStats[timeOfDay].total++;
            if (ritual.result.success) {
                timeStats[timeOfDay].successful++;
            }
        });

        let bestTime = '';
        let bestRate = 0;

        Object.entries(timeStats).forEach(([time, stats]) => {
            if (stats.total > 0) {
                const rate = stats.successful / stats.total;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestTime = time;
                }
            }
        });

        const timeMap = {
            morning: 'Утро (5-12)',
            day: 'День (12-17)',
            evening: 'Вечер (17-22)',
            night: 'Ночь (22-5)'
        };

        return timeMap[bestTime] || 'Нет данных';
    }

    private analyzeEnergyPattern(rituals: any[]): string {
        if (rituals.length < 3) return 'НЕДОСТАТОЧНО ДАННЫХ';

        const successful = rituals.filter(r => r.result.success).length;
        const successRate = successful / rituals.length;

        if (successRate > 0.8) return 'СТАБИЛЬНО ВЫСОКАЯ';
        if (successRate > 0.6) return 'УМЕРЕННО СТАБИЛЬНАЯ';
        if (successRate > 0.4) return 'НЕСТАБИЛЬНАЯ';
        return 'ХАОТИЧНАЯ';
    }

    private generateLocationRecommendations(location: string, successRate: number): string[] {
        const recommendations = [];

        if (successRate < 50) {
            recommendations.push('Попробуйте другие типы ритуалов в этой локации');
            recommendations.push('Улучшите подготовку и компоненты');
        }

        if (successRate > 80) {
            recommendations.push('Эта локация идеальна для ритуалов. Используйте её чаще');
        }

        if (location.includes('кремль') || location.includes('храм')) {
            recommendations.push('Светлые ритуалы будут особенно эффективны');
        }

        if (location.includes('лес') || location.includes('овраг')) {
            recommendations.push('Тёмные ритуалы могут быть усилены здесь');
        }

        return recommendations;
    }
}