import { Injectable } from '@nestjs/common';
import { CreateBalanceDto } from '../reality/dto/create-balance.dto';

@Injectable()
export class BalanceService {
    private balancePoints = new Map();

    async createBalancePoint(balanceDto: CreateBalanceDto) {
        const { location, lightEnergy, darknessEnergy, creatorId } = balanceDto;

        // Проверка существующего баланса
        if (this.balancePoints.has(location)) {
            throw new Error(`Баланс в локации ${location} уже существует`);
        }

        // Создание точки баланса
        const balancePoint = {
            id: `balance_${Date.now()}`,
            location,
            lightEnergy,
            darknessEnergy,
            equilibrium: this.calculateEquilibrium(lightEnergy, darknessEnergy),
            creatorId,
            createdAt: new Date(),
            lastUpdated: new Date(),
            stability: this.calculateStability(lightEnergy, darknessEnergy),
            realms: this.determineAffectedRealms(location)
        };

        this.balancePoints.set(location, balancePoint);

        return {
            ...balancePoint,
            message: 'Точка баланса успешно создана',
            harmony: this.getHarmonyLevel(balancePoint.equilibrium),
            recommendations: this.generateBalanceRecommendations(balancePoint)
        };
    }

    async adjustBalance(location: string, lightAdjustment: number, darknessAdjustment: number, reason: string) {
        const balancePoint = this.balancePoints.get(location);

        if (!balancePoint) {
            throw new Error(`Точка баланса в локации ${location} не найдена`);
        }

        // Корректировка энергий
        balancePoint.lightEnergy = Math.max(0, Math.min(100, balancePoint.lightEnergy + lightAdjustment));
        balancePoint.darknessEnergy = Math.max(0, Math.min(100, balancePoint.darknessEnergy + darknessAdjustment));
        balancePoint.equilibrium = this.calculateEquilibrium(balancePoint.lightEnergy, balancePoint.darknessEnergy);
        balancePoint.lastUpdated = new Date();
        balancePoint.stability = this.calculateStability(balancePoint.lightEnergy, balancePoint.darknessEnergy);

        // Запись изменений
        if (!balancePoint.adjustments) {
            balancePoint.adjustments = [];
        }
        balancePoint.adjustments.push({
            timestamp: new Date(),
            lightAdjustment,
            darknessAdjustment,
            reason,
            newEquilibrium: balancePoint.equilibrium
        });

        this.balancePoints.set(location, balancePoint);

        return {
            location,
            previousEnergies: {
                light: balancePoint.lightEnergy - lightAdjustment,
                darkness: balancePoint.darknessEnergy - darknessAdjustment
            },
            currentEnergies: {
                light: balancePoint.lightEnergy,
                darkness: balancePoint.darknessEnergy
            },
            equilibrium: balancePoint.equilibrium,
            stability: balancePoint.stability,
            harmony: this.getHarmonyLevel(balancePoint.equilibrium),
            message: 'Баланс успешно скорректирован'
        };
    }

    getBalanceStatus(location: string) {
        const balancePoint = this.balancePoints.get(location);

        if (!balancePoint) {
            throw new Error(`Точка баланса в локации ${location} не найдена`);
        }

        return {
            ...balancePoint,
            status: this.getBalanceStatusLevel(balancePoint),
            warnings: this.generateWarnings(balancePoint),
            suggestions: this.generateSuggestions(balancePoint)
        };
    }

    getAllBalancePoints() {
        return Array.from(this.balancePoints.values()).map(point => ({
            location: point.location,
            lightEnergy: point.lightEnergy,
            darknessEnergy: point.darknessEnergy,
            equilibrium: point.equilibrium,
            stability: point.stability,
            status: this.getBalanceStatusLevel(point)
        }));
    }

    calculateGlobalBalance() {
        const points = Array.from(this.balancePoints.values());

        if (points.length === 0) {
            return {
                globalEquilibrium: 0,
                overallStability: 'НЕОПРЕДЕЛЕН',
                message: 'Нет активных точек баланса'
            };
        }

        const totalLight = points.reduce((sum, point) => sum + point.lightEnergy, 0);
        const totalDarkness = points.reduce((sum, point) => sum + point.darknessEnergy, 0);
        const avgLight = totalLight / points.length;
        const avgDarkness = totalDarkness / points.length;
        const globalEquilibrium = this.calculateEquilibrium(avgLight, avgDarkness);

        return {
            globalEquilibrium,
            overallStability: this.calculateGlobalStability(points),
            lightDominance: avgLight > avgDarkness ? 'СВЕТ' : avgDarkness > avgLight ? 'ТЬМА' : 'БАЛАНС',
            activePoints: points.length,
            mostStable: this.findMostStablePoint(points),
            mostUnstable: this.findMostUnstablePoint(points)
        };
    }

    private calculateEquilibrium(light: number, darkness: number): number {
        if (light + darkness === 0) return 0;
        const ratio = Math.min(light, darkness) / Math.max(light, darkness);
        return Math.round(ratio * 100);
    }

    private calculateStability(light: number, darkness: number): string {
        const equilibrium = this.calculateEquilibrium(light, darkness);

        if (equilibrium >= 90) return 'АБСОЛЮТНАЯ';
        if (equilibrium >= 75) return 'ВЫСОКАЯ';
        if (equilibrium >= 60) return 'СТАБИЛЬНАЯ';
        if (equilibrium >= 40) return 'НЕУСТОЙЧИВАЯ';
        if (equilibrium >= 25) return 'КРИТИЧЕСКАЯ';
        return 'КАТАСТРОФИЧЕСКАЯ';
    }

    private determineAffectedRealms(location: string): string[] {
        const realmMap = {
            'Нижегородский кремль': ['Явь', 'Правь'],
            'Стрелка Волги и Оки': ['Явь', 'Правь', 'Навь'],
            'Почаинский овраг': ['Явь', 'Навь'],
            'Лес': ['Явь', 'Навь'],
            'Храм': ['Правь', 'Явь'],
            'Кладбище': ['Навь', 'Явь']
        };

        return realmMap[location] || ['Явь'];
    }

    private getHarmonyLevel(equilibrium: number): string {
        if (equilibrium >= 95) return 'ИДЕАЛЬНАЯ ГАРМОНИЯ';
        if (equilibrium >= 85) return 'ПОЛНАЯ ГАРМОНИЯ';
        if (equilibrium >= 70) return 'УСТОЙЧИВЫЙ БАЛАНС';
        if (equilibrium >= 50) return 'НЕЙТРАЛИТЕТ';
        if (equilibrium >= 30) return 'НАПРЯЖЕНИЕ';
        if (equilibrium >= 15) return 'КОНФЛИКТ';
        return 'ХАОС';
    }

    private getBalanceStatusLevel(balancePoint: any): string {
        const equilibrium = balancePoint.equilibrium;
        const stability = balancePoint.stability;

        if (equilibrium >= 80 && stability === 'АБСОЛЮТНАЯ') return 'ИДЕАЛЬНЫЙ';
        if (equilibrium >= 70 && stability === 'ВЫСОКАЯ') return 'ОТЛИЧНЫЙ';
        if (equilibrium >= 60 && stability === 'СТАБИЛЬНАЯ') return 'ХОРОШИЙ';
        if (equilibrium >= 40) return 'ТРЕБУЕТ ВНИМАНИЯ';
        if (equilibrium >= 20) return 'ОПАСНЫЙ';
        return 'КРИТИЧЕСКИЙ';
    }

    private generateBalanceRecommendations(balancePoint: any): string[] {
        const recommendations = [];
        const { lightEnergy, darknessEnergy, equilibrium } = balancePoint;

        if (lightEnergy > darknessEnergy * 1.5) {
            recommendations.push('Слишком много Света. Проведите теневой ритуал.');
        }

        if (darknessEnergy > lightEnergy * 1.5) {
            recommendations.push('Слишком много Тьмы. Выполните очищение Светом.');
        }

        if (equilibrium < 60) {
            recommendations.push('Баланс нарушен. Требуется корректировка энергий.');
        }

        if (balancePoint.stability === 'НЕУСТОЙЧИВАЯ' || balancePoint.stability === 'КРИТИЧЕСКАЯ') {
            recommendations.push('Стабильность низкая. Укрепите точку баланса.');
        }

        return recommendations;
    }

    private generateWarnings(balancePoint: any): string[] {
        const warnings = [];
        const { lightEnergy, darknessEnergy, equilibrium, stability } = balancePoint;

        if (equilibrium < 30) {
            warnings.push('ВНИМАНИЕ: Сильный дисбаланс может привести к разрыву реальности!');
        }

        if (stability === 'КРИТИЧЕСКАЯ' || stability === 'КАТАСТРОФИЧЕСКАЯ') {
            warnings.push('КРИТИЧЕСКИЙ УРОВЕНЬ: Точка баланса может разрушиться!');
        }

        if (Math.abs(lightEnergy - darknessEnergy) > 70) {
            warnings.push('ПРЕДУПРЕЖДЕНИЕ: Одна из энергий доминирует опасно!');
        }

        return warnings;
    }

    private generateSuggestions(balancePoint: any): string[] {
        const suggestions = [];
        const { lightEnergy, darknessEnergy } = balancePoint;

        if (lightEnergy < 30) {
            suggestions.push('Проведите ритуал призыва Света');
        }

        if (darknessEnergy < 30) {
            suggestions.push('Выполните обряд принятия Тьмы');
        }

        if (balancePoint.realms.includes('Навь') && darknessEnergy < 40) {
            suggestions.push('Усильте связь с Навью через теневые ритуалы');
        }

        if (balancePoint.realms.includes('Правь') && lightEnergy < 40) {
            suggestions.push('Укрепите связь с Правью через светлые обряды');
        }

        return suggestions;
    }

    private calculateGlobalStability(points: any[]): string {
        const stablePoints = points.filter(point =>
            point.stability === 'АБСОЛЮТНАЯ' || point.stability === 'ВЫСОКАЯ'
        ).length;

        const ratio = stablePoints / points.length;

        if (ratio >= 0.8) return 'ВЕЛИКОЛЕПНАЯ';
        if (ratio >= 0.6) return 'ХОРОШАЯ';
        if (ratio >= 0.4) return 'УДОВЛЕТВОРИТЕЛЬНАЯ';
        if (ratio >= 0.2) return 'ПЛОХАЯ';
        return 'КАТАСТРОФИЧЕСКАЯ';
    }

    private findMostStablePoint(points: any[]): string {
        if (points.length === 0) return 'Нет точек';

        const stablePoints = points.filter(point =>
            point.stability === 'АБСОЛЮТНАЯ' || point.stability === 'ВЫСОКАЯ'
        );

        if (stablePoints.length === 0) return 'Нет стабильных точек';

        return stablePoints.sort((a, b) => b.equilibrium - a.equilibrium)[0].location;
    }

    private findMostUnstablePoint(points: any[]): string {
        if (points.length === 0) return 'Нет точек';

        const unstablePoints = points.filter(point =>
            point.stability === 'КРИТИЧЕСКАЯ' || point.stability === 'КАТАСТРОФИЧЕСКАЯ'
        );

        if (unstablePoints.length === 0) return 'Нет нестабильных точек';

        return unstablePoints.sort((a, b) => a.equilibrium - b.equilibrium)[0].location;
    }
}