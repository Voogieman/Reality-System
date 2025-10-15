import { Injectable } from '@nestjs/common';
import { ContactGodDto } from '../reality/dto/contact-god.dto';
import { SLAVIC_GODS } from './slavic-gods.constants';

@Injectable()
export class GodsService {
    private divineConnections = new Map();

    async establishContact(contactDto: ContactGodDto) {
        const god = SLAVIC_GODS[contactDto.godName];

        if (!god) {
            throw new Error(`Бог ${contactDto.godName} не найден в славянском пантеоне`);
        }

        // Проверка готовности к контакту
        const readiness = this.checkReadiness(contactDto.userId, contactDto.offering);
        if (!readiness.ready) {
            throw new Error(`Не готов к контакту: ${readiness.reason}`);
        }

        // Установление связи
        const connection = this.createDivineConnection(contactDto, god);

        // Получение дара
        const gift = this.receiveDivineGift(god, contactDto.offering, contactDto.intention);

        // Запись контакта
        this.divineConnections.set(connection.id, {
            god: god.name,
            user: contactDto.userId,
            timestamp: new Date(),
            connectionStrength: connection.strength,
            gift: gift
        });

        return {
            god: god.name,
            domain: god.domain,
            connectionStrength: connection.strength,
            message: this.getGodMessage(god.name, contactDto.intention),
            gift: gift,
            duration: connection.duration,
            requirements: this.getGodRequirements(god.name)
        };
    }

    getGodStatus(godName: string) {
        const god = SLAVIC_GODS[godName];
        if (!god) {
            throw new Error(`Бог ${godName} не найден`);
        }

        const connections = Array.from(this.divineConnections.values())
            .filter(conn => conn.god === god.name);

        return {
            god: god.name,
            domain: god.domain,
            element: god.element,
            activeConnections: connections.length,
            averageStrength: this.calculateAverageStrength(connections),
            availability: this.checkGodAvailability(god.name),
            recentActivity: this.getRecentActivity(god.name)
        };
    }

    getAllGods() {
        return Object.values(SLAVIC_GODS).map(god => ({
            name: god.name,
            domain: god.domain,
            element: god.element,
            description: god.description,
            preferredOfferings: god.preferredOfferings
        }));
    }

    private checkReadiness(userId: string, offering: any) {
        if (offering.purity < 70) {
            return { ready: false, reason: 'Подношение недостаточно чистое' };
        }

        if (offering.significance < 50) {
            return { ready: false, reason: 'Подношение недостаточно значимое' };
        }

        // Проверка предыдущих контактов
        const recentContacts = this.getRecentUserContacts(userId);
        if (recentContacts.length >= 3) {
            return { ready: false, reason: 'Слишком много контактов за короткое время' };
        }

        return { ready: true, reason: 'Готов к божественному контакту' };
    }

    private createDivineConnection(contactDto: ContactGodDto, god: any) {
        const strength = this.calculateConnectionStrength(contactDto.offering);
        const duration = this.calculateConnectionDuration(strength);

        return {
            id: `divine_${Date.now()}`,
            strength: strength,
            duration: duration,
            channel: this.establishCommunicationChannel(god.element)
        };
    }

    private receiveDivineGift(god: any, offering: any, intention: string) {
        const giftPower = this.calculateGiftPower(offering, intention);

        const gifts = {
            'Белобог': {
                type: 'Руна Мира',
                power: 'Созидание и Порядок',
                effect: `+${giftPower} к гармонии`,
                blessing: 'Свет озаряет твой путь'
            },
            'Чернобог': {
                type: 'Руна Силы',
                power: 'Преобразование и Хаос',
                effect: `+${giftPower} к энергии`,
                blessing: 'Тьма открывает новые пути'
            },
            'Перун': {
                type: 'Руна Защиты',
                power: 'Молния и Отвага',
                effect: `+${giftPower} к защите`,
                blessing: 'Гром сопровождает твои деяния'
            },
            'Мокошь': {
                type: 'Руна Жизни',
                power: 'Судьба и Плодородие',
                effect: `+${giftPower} к здоровью`,
                blessing: 'Земля даёт тебе силу'
            },
            'Велес': {
                type: 'Руна Знания',
                power: 'Мудрость и Магия',
                effect: `+${giftPower} к мудрости`,
                blessing: 'Тайны мира открываются тебе'
            },
            'Вышень': {
                type: 'Руна Справедливости',
                power: 'Закон и Порядок',
                effect: `+${giftPower * 1.5} ко всем характеристикам`,
                blessing: 'Вышний суд направляет твой путь',
                special: 'Божественная защита от несправедливости',
                authority: 'Право вершить правосудие от имени Вышня'
            }
        };

        return gifts[god.name] || {
            type: 'Божественное Благословение',
            power: 'Удача',
            effect: '+10 ко всем характеристикам',
            blessing: 'Боги благосклонны к тебе'
        };
    }

    private calculateConnectionStrength(offering: any): number {
        return Math.min(100, (offering.purity + offering.significance) / 2);
    }

    private calculateConnectionDuration(strength: number): string {
        if (strength >= 90) return '7 дней';
        if (strength >= 70) return '3 дня';
        if (strength >= 50) return '1 день';
        return '12 часов';
    }

    private establishCommunicationChannel(element: string): string {
        const channels = {
            'воздух': 'Ветер и Шёпот',
            'огонь': 'Пламя и Искры',
            'земля': 'Камни и Корни',
            'вода': 'Родники и Реки'
        };
        return channels[element] || 'Духовный Канал';
    }

    private calculateGiftPower(offering: any, intention: string): number {
        const basePower = (offering.purity + offering.significance) / 4;
        const intentionBonus = intention.length * 0.5; // Чем конкретнее намерение, тем сильнее дар
        return Math.floor(basePower + intentionBonus);
    }

    private getGodMessage(godName: string, intention: string): string {
        const messages = {
            'Белобог': `Свет направляет твоё намерение: "${intention}". Неси порядок и добро.`,
            'Чернобог': `Тьма принимает твоё желание: "${intention}". Помни о балансе.`,
            'Перун': `Молния заряжает твою цель: "${intention}". Защищай слабых.`,
            'Мокошь': `Судьба вплетает твоё стремление: "${intention}". Береги жизнь.`,
            'Велес': `Мудрость освещает твой путь: "${intention}". Стремись к знанию.`
        };
        return messages[godName] || `Боги слышат твоё намерение: "${intention}".`;
    }

    private getGodRequirements(godName: string): string[] {
        const requirements = {
            'Белобог': ['Чистота помыслов', 'Стремление к порядку', 'Защита слабых'],
            'Чернобог': ['Принятие хаоса', 'Смелость перемен', 'Уважение к тьме'],
            'Перун': ['Мужество', 'Справедливость', 'Сила воли'],
            'Мокошь': ['Уважение к природе', 'Забота о семье', 'Трудолюбие'],
            'Велес': ['Любознательность', 'Мудрость', 'Уважение к знаниям']
        };
        return requirements[godName] || ['Честность', 'Уважение', 'Баланс'];
    }

    private getRecentUserContacts(userId: string): any[] {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return Array.from(this.divineConnections.values())
            .filter(conn => conn.user === userId && new Date(conn.timestamp) > oneHourAgo);
    }

    private calculateAverageStrength(connections: any[]): number {
        if (connections.length === 0) return 0;
        const total = connections.reduce((sum, conn) => sum + conn.connectionStrength, 0);
        return Math.round(total / connections.length);
    }

    private checkGodAvailability(godName: string): string {
        // Простая логика доступности богов
        const hour = new Date().getHours();
        const availability = {
            'Белобог': hour >= 6 && hour < 18 ? 'ДОСТУПЕН' : 'ОГРАНИЧЕННО',
            'Чернобог': hour >= 18 || hour < 6 ? 'ДОСТУПЕН' : 'ОГРАНИЧЕННО',
            'Перун': 'ВСЕГДА ДОСТУПЕН',
            'Мокошь': 'ВСЕГДА ДОСТУПЕН',
            'Велес': 'ВСЕГДА ДОСТУПЕН'
        };
        return availability[godName] || 'НЕИЗВЕСТНО';
    }

    private getRecentActivity(godName: string): string {
        const connections = Array.from(this.divineConnections.values())
            .filter(conn => conn.god === godName)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (connections.length === 0) return 'Нет recent activity';

        const lastContact = connections[0];
        const timeDiff = Date.now() - new Date(lastContact.timestamp).getTime();
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));

        if (hoursDiff < 1) return 'ОЧЕНЬ АКТИВЕН';
        if (hoursDiff < 24) return 'АКТИВЕН';
        if (hoursDiff < 168) return 'УМЕРЕННО АКТИВЕН';
        return 'МАЛО АКТИВЕН';
    }
}