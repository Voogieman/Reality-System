import { Injectable } from '@nestjs/common';
import { AwakenBloodlineDto } from '../reality/dto/awaken-bloodline.dto';

@Injectable()
export class BloodlineService {
    private bloodlineMemory = new Map();

    async awaken(awakenDto: AwakenBloodlineDto) {
        // Проверка фамильной реликвии
        const isHeirloomValid = this.validateHeirloom(awakenDto.heirloom);

        if (!isHeirloomValid) {
            throw new Error('Фамильная реликвия не прошла верификацию');
        }

        // Активация родовой памяти
        const ancestralMemory = this.activateAncestralMemory(awakenDto.userId);

        // Пробуждение рун
        const activatedRunes = this.awakenRunes(awakenDto.userId);

        // Запись в память системы
        this.bloodlineMemory.set(awakenDto.userId, {
            awakened: true,
            timestamp: new Date(),
            location: awakenDto.location,
            runes: activatedRunes,
            memoryLevel: ancestralMemory.level
        });

        return {
            ancestralMemory: ancestralMemory,
            activatedRunes: activatedRunes,
            energyLevel: 85,
            spiritualConnection: 'Установлена связь с родом',
            blessings: ['Благословение Предков', 'Защита Рода'],
            message: 'Кровь предков пробуждена. Ты теперь Хранитель.'
        };
    }

    async upgradeSkills(upgradeDto: any) {
        const { userId, skills, energyCost } = upgradeDto;

        const bloodlineData = this.bloodlineMemory.get(userId);
        if (!bloodlineData) {
            throw new Error('Родовая кровь не пробуждена');
        }

        // Проверка достаточности энергии
        if (bloodlineData.energyLevel < energyCost) {
            throw new Error('Недостаточно энергии для улучшения навыков');
        }

        // Улучшение навыков
        const upgradedSkills = skills.map(skill => ({
            name: skill,
            oldLevel: this.getSkillLevel(skill),
            newLevel: this.calculateNewLevel(skill),
            improvement: this.calculateImprovement(skill)
        }));

        // Обновление энергии
        bloodlineData.energyLevel -= energyCost;
        this.bloodlineMemory.set(userId, bloodlineData);

        return {
            upgradedSkills,
            remainingEnergy: bloodlineData.energyLevel,
            timeRequired: this.calculateUpgradeTime(skills.length),
            message: 'Навыки успешно улучшены. Сила рода укрепляется.'
        };
    }

    getBloodlineStatus(userId: string) {
        const data = this.bloodlineMemory.get(userId);
        if (!data) {
            throw new Error('Данные о родовой линии не найдены');
        }

        return {
            awakened: data.awakened,
            energyLevel: data.energyLevel,
            activeRunes: data.runes,
            memoryLevel: data.memoryLevel,
            connectionStrength: this.calculateConnectionStrength(data),
            recommendations: this.generateRecommendations(data)
        };
    }

    private validateHeirloom(heirloom: string): boolean {
        const validHeirlooms = [
            'Медный браслет предков',
            'Родовой амулет',
            'Фамильное кольцо',
            'Наследственный талисман'
        ];
        return validHeirlooms.includes(heirloom);
    }

    private activateAncestralMemory(userId: string) {
        const memories = {
            fragments: [
                'Знание древних рун',
                'Управление потоками энергии',
                'Коммуникация с духами предков',
                'Создание защитных барьеров'
            ],
            level: 'ПРОСНУВШИЙСЯ',
            access: ['Явь', 'Правь', 'Навь']
        };

        return memories;
    }

    private awakenRunes(userId: string) {
        const baseRunes = [
            { name: 'Мир', type: 'созидание', power: 25, element: 'воздух' },
            { name: 'Сила', type: 'усиление', power: 30, element: 'огонь' },
            { name: 'Защита', type: 'защита', power: 35, element: 'земля' },
            { name: 'Жизнь', type: 'исцеление', power: 40, element: 'вода' }
        ];

        return baseRunes;
    }

    private getSkillLevel(skill: string): string {
        const levels = ['Новичок', 'Ученик', 'Адепт', 'Мастер', 'Великий Мастер'];
        return levels[Math.floor(Math.random() * levels.length)];
    }

    private calculateNewLevel(skill: string): string {
        const levels = ['Новичок', 'Ученик', 'Адепт', 'Мастер', 'Великий Мастер'];
        const currentIndex = levels.indexOf(this.getSkillLevel(skill));
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
    }

    private calculateImprovement(skill: string): number {
        return Math.floor(Math.random() * 30) + 10;
    }

    private calculateUpgradeTime(numberOfSkills: number): string {
        const baseTime = numberOfSkills * 2;
        return `${baseTime} дня`;
    }

    private calculateConnectionStrength(data: any): string {
        if (data.energyLevel >= 80) return 'МОГУЩЕСТВЕННАЯ';
        if (data.energyLevel >= 60) return 'СИЛЬНАЯ';
        if (data.energyLevel >= 40) return 'УМЕРЕННАЯ';
        return 'СЛАБАЯ';
    }

    private generateRecommendations(data: any): string[] {
        const recommendations = [];

        if (data.energyLevel < 50) {
            recommendations.push('Проведите ритуал подпитки энергии');
        }

        if (data.memoryLevel === 'ПРОСНУВШИЙСЯ') {
            recommendations.push('Изучите родовые архивы для усиления памяти');
        }

        if (data.runes.length < 4) {
            recommendations.push('Найдите недостающие руны для полной силы');
        }

        return recommendations;
    }
}