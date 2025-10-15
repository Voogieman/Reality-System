import { Injectable, NotFoundException } from '@nestjs/common';
import { BloodlineService } from '../bloodline/bloodline.service';
import { BalanceService } from '../balance/balance.service';
import { RitualsService } from '../rituals/rituals.service';
import { AwakenBloodlineDto } from './dto/awaken-bloodline.dto';
import { ContactGodDto } from './dto/contact-god.dto';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { PerformRitualDto } from './dto/perform-ritual.dto';
import {GodsService} from "../goods/gods.service";

@Injectable()
export class RealityService {
    constructor(
        private readonly bloodlineService: BloodlineService,
        private readonly godsService: GodsService,
        private readonly balanceService: BalanceService,
        private readonly ritualsService: RitualsService,
    ) {}

    async awakenBloodline(awakenDto: AwakenBloodlineDto) {
        const bloodline = await this.bloodlineService.awaken(awakenDto);

        return {
            success: true,
            message: 'Родовая кровь пробуждена. Сила предков течёт в твоих жилах!',
            data: bloodline,
            blessing: 'Да прибудет с тобой мудрость рода твоего!',
            timestamp: new Date().toISOString()
        };
    }

    async contactGod(contactDto: ContactGodDto) {
        const contact = await this.godsService.establishContact(contactDto);

        return {
            success: true,
            message: `Контакт человека ${contactDto.userId} с Богом ${contactDto.godName} установлена`,
            data: contact,
            guidance: 'Боги говорят с теми, кто умеет слушать.',
            timestamp: new Date().toISOString()
        };
    }

    async createBalance(balanceDto: CreateBalanceDto) {
        const balance = await this.balanceService.createBalancePoint(balanceDto);

        return {
            success: true,
            message: 'Точка баланса создана между Явью, Правью и Навью',
            data: balance,
            wisdom: 'Равновесие - основа мироздания.',
            timestamp: new Date().toISOString()
        };
    }

    async performRitual(ritualDto: PerformRitualDto) {
        try {
            const ritual = await this.ritualsService.performRitual(ritualDto);

            return {
                success: true,
                message: `Ритуал "${ritualDto.ritualType}" успешно выполнен`,
                data: ritual,
                effect: 'Силы природы отвечают на твой зов.',
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            throw new Error(e)
        }
    }

    async getCharacter(id: string) {
        if (id !== 'vugar_guliev') {
            throw new NotFoundException('Персонаж не найден');
        }

        return {
            character: {
                firstname: "Вугар",
                lastname: "Гулиев",
                patronymic: "Шахид Оглы",
                age: "29 лет",
                weight: "67 кг",
                height: "177 см",
                build: "Атлетическое",
                occupation: "Ведущий Node.js Разработчик / Последний Хранитель / Проводник",
                location: "Нижний Новгород, Московский район, Московское шоссе",
                contacts: {
                    phone: "+7 (909) 2864847",
                    telegram: "@Voogieman",
                    email: "vugarguliev333@gmail.com",
                    github: "https://github.com/Voogieman"
                },
                current_position: "VibeLab (работа над Госуслугами Чукотского АО)",
                skills: {
                    technical: [
                        "Node.js", "NestJS", "PostgreSQL", "Микросервисная архитектура",
                        "Docker", "Redis", "Kafka", "RabbitMQ", "gRPC", "TypeORM",
                        "Kubernetes", "Blockchain", "Smart contracts"
                    ],
                    magical: [
                        "Управление потоками энергии", "Рунная магия", "Создание защитных барьеров",
                        "Коммуникация с богами", "Балансировка реальности", "Краш",
                        "Мудрость предков", "Тайные знания"
                    ]
                },
                character_state: "Спокойный/Видящий/Управляющий",
                mission: "Хранитель баланса между мирами"
            }
        };
    }

    async getScenes(act: string) {
        const scenes = this.getScenesByAct(act);

        if (scenes.length === 0) {
            throw new NotFoundException(`Акт ${act} не найден`);
        }

        return {
            act: act,
            title: this.getActTitle(act),
            scenes: scenes,
            total: scenes.length,
            period: this.getActPeriod(act)
        };
    }

    async upgradeSkills(upgradeDto: any) {
        const result = await this.bloodlineService.upgradeSkills(upgradeDto);

        return {
            success: true,
            message: 'Навыки успешно улучшены',
            data: result,
            progress: 'Твой путь к мастерству продолжается.',
            timestamp: new Date().toISOString()
        };
    }

    async getSystemStatus() {
        const status = {
            system: 'Slavic Reality System',
            version: '1.0.0',
            status: 'OPERATIONAL',
            realms: {
                yav: 'Активен',
                prav: 'Стабилен',
                nav: 'Под контролем'
            },
            balance: 'Гармония',
            gods_connection: 'Установлена',
            ancestral_memory: 'Активна',
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            data: status,
            message: 'Система функционирует в нормальном режиме'
        };
    }

    private getScenesByAct(act: string): any[] {
        const scenesDatabase = {
            '1': [
                {
                    scene_number: 1,
                    title: "Зов Предков",
                    date: "2025-03-22",
                    time: "23:30",
                    location: "Квартира Вугара, Московское шоссе, Нижний Новгород",
                    description: "Вугар работает над MVP 'Госуслуг Чукотского АО'. Внезапно его код в NestJS начинает трансформироваться в древние славянские символы. Кружка замирает в воздухе, окруженная золотистыми искрами. Появляется голос: 'Кровь наша... проснись...'",
                    technical_details: {
                        project: "Госуслуги Чукотского АО MVP",
                        stack: ["NestJS", "PostgreSQL", "Docker", "Prisma"],
                        anomaly: "Самопроизвольная трансформация кода в руны",
                        energy_signature: "Пробуждение родовой памяти"
                    },
                    character_state: "Рационален, но озадачен пробуждением сил"
                },
                {
                    scene_number: 1,
                    title: "Тень над Городом",
                    date: "2025-04-22",
                    time: "19:00",
                    location: "Набережная Волги, Нижний Новгород",
                    description: "Вугар видит Навьи - темные сущности, питающиеся страхом. Инстинктивно произносит древнее заклинание, и от его ладони исходит теплый свет, отгоняющий твари. Понимает, что видит астральный план.",
                    technical_details: {
                        observation: "Аномалии в городской энергии",
                        reaction: "Инстинктивное использование магии",
                        plane_interaction: "Видение Нави (астрального плана)"
                    },
                    character_state: "Осознает наличие сверхъестественного и двойственность мира"
                },
            ],
            '2': [
                {
                    scene_number: 3,
                    title: "Проводник – Волхв",
                    date: "2025-05-05",
                    time: "11:00",
                    location: "Деревня под Городцом",
                    description: "Встреча с последним волхвом: 'Мир - это код. Явь - физический сервер, Правь - системные библиотеки, Навь - темная сеть. Боги - API endpoints. Ты - системный администратор реальности.'",
                    technical_details: {
                        mentorship: "Обучение архитектуре мироздания",
                        mission: "Рефакторинг божественной архитектуры",
                        system_analogy: "Техническая модель трех миров"
                    },
                    character_state: "Профессиональное понимание задачи"
                },
                {
                    scene_number: 4,
                    title: "Сила Белобога",
                    date: "2025-05-12",
                    time: "14:00",
                    location: "Святилище Белобога",
                    description: "Испытание чистотой намерений. Вугар отказывается от абсолютной власти, доказывая готовность служить балансу. Получает доступ к API света.",
                    technical_details: {
                        test: "Проверка уровня доступа",
                        reward: "Light API access key",
                        principle: "Принцип наименьших привилегий"
                    },
                    character_state: "Мудрое самоограничение, понимание ответственности"
                },
                {
                    scene_number: 5,
                    title: "Договор с Чернобогом",
                    date: "2025-05-19",
                    time: "16:00",
                    location: "Храм Тьмы",
                    description: "Принимает Тьму как необходимую часть системы. Заключает договор о ненападении и получает доступ к Dark API для балансировки.",
                    technical_details: {
                        negotiation: "Заключение service level agreement",
                        access: "Dark API permissions",
                        balance: "Баланс light/dark protocols"
                    },
                    character_state: "Дипломатичный, понимающий необходимость обеих сил"
                },
                {
                    scene_number: 6,
                    title: "Мудрость Велеса",
                    date: "2025-05-23",
                    time: "13:00",
                    location: "Священная роща",
                    description: "Вугар получает знания о циклической природе мироздания от Велеса. Понимает, что технологии и магия - две стороны одной монеты, связанные вечными циклами.",
                    technical_details: {
                        deity: "Велес - бог мудрости и магии",
                        knowledge: "Циклическая архитектура реальности",
                        integration: "Синтез технологических и магических принципов"
                    },
                    character_state: "Просветленный, видящий системные связи"
                }
            ],
            '3': [
                {
                    scene_number: 7,
                    title: "Нарастание Угрозы",
                    date: "2025-05-26",
                    time: "20:00",
                    location: "Нижний Новгород",
                    description: "Навьи усиливают атаки на физический мир. Вугар создает распределенную сеть защиты, используя городские энергетические узлы как точки доступа.",
                    technical_details: {
                        threat_level: "Критический",
                        defense: "Распределенная защитная сеть",
                        infrastructure: "Использование городской энергосети"
                    },
                    character_state: "Стратег, готовящийся к битве"
                },
                {
                    scene_number: 8,
                    title: "Подготовка к Битве",
                    date: "2025-05-30",
                    time: "16:00",
                    location: "Нижегородский кремль",
                    description: "Вугар активирует древние защитные механизмы города. Руны на стенах кремля начинают светиться, создавая многослойный щит вокруг Нижнего Новгорода.",
                    technical_details: {
                        activation: "Древние защитные системы города",
                        defense_layers: "Многоуровневая защита физического и астрального планов",
                        energy_source: "Городская лей-линия"
                    },
                    character_state: "Сосредоточенный, готовый к защите"
                },
                {
                    scene_number: 9,
                    title: "Осада Нижнего",
                    date: "2025-06-03",
                    time: "15:00",
                    location: "Стрелка Волги и Оки",
                    description: "В день рождения Вугара начинается финальная битва. Армии Нави атакуют через разрывы между мирами. Вугар координирует защиту на обоих планах одновременно.",
                    technical_details: {
                        crisis: "Массовая атака через межпространственные разрывы",
                        response: "Координация защиты в физическом и астральном мирах",
                        multi_plane_warfare: "Синхронные действия на двух планах"
                    },
                    character_state: "Командующий в мультиплановой битве"
                },
                {
                    scene_number: 10,
                    title: "Кульминация Битвы",
                    date: "2025-06-03",
                    time: "20:00",
                    location: "Центр города",
                    description: "Темные силы прорывают первую линию защиты. Вугар вступает в прямую конфронтацию с предводителем Нави, используя комбинацию магии и технологий.",
                    technical_details: {
                        confrontation: "Прямой бой с лидером темных сил",
                        tactics: "Комбинирование магических и технологических атак",
                        adaptation: "Динамическое изменение стратегии"
                    },
                    character_state: "Решительный, использующий все ресурсы"
                },
                {
                    scene_number: 11,
                    title: "Восстановление Баланса",
                    date: "2025-06-03",
                    time: "23:00",
                    location: "Эпицентр битвы",
                    description: "Вугар понимает, что нужно не уничтожать Тьму, а восстанавливать баланс. Запускает глобальный процесс синхронизации миров, используя свою кровь как ключ.",
                    technical_details: {
                        solution: "Глобальная синхронизация миров",
                        method: "Кровь хранителя как аутентификационный токен",
                        process: "Rebalance universe operation"
                    },
                    character_state: "Мудрый архитектор, видящий системное решение"
                },
                {
                    scene_number: 12,
                    title: "Летнее Солнцестояние",
                    date: "2025-06-21",
                    time: "12:00",
                    location: "Древнее капище на Дятловых горах",
                    description: "Вугар проводит ритуал летнего солнцестояния, усиливая связь между мирами в точке максимальной солнечной энергии. Природа расцветает с невероятной силой.",
                    technical_details: {
                        ritual: "Солнцестояние - пик солнечной энергии",
                        effect: "Усиление связи Явь-Правь",
                        natural_response: "Ускоренный рост и цветение"
                    },
                    character_state: "Соединенный с природными циклами"
                },
            ],
            '4': [
                {
                    scene_number: 13,
                    title: "Новая Эра Баланса",
                    date: "2025-10-13",
                    time: "14:00",
                    location: "Нижний Новгород",
                    description: "Возвращение после полной трансформации. Миры синхронизированы, технологии работают в гармонии с магией. Вугар ощущает постоянную связь с обоими планами.",
                    technical_details: {
                        status: "Миры синхронизированы",
                        connection: "Постоянная связь Явь-Правь-Навь",
                        harmony: "Технология + магия = симбиоз"
                    },
                    character_state: "Спокойный хранитель, ощущающий единство миров"
                },
                {
                    scene_number: 15,
                    title: "Период Восстановления",
                    date: "2025-06-10",
                    time: "14:00",
                    location: "Нижний Новгород",
                    description: "После битвы Вугар восстанавливает поврежденные энергетические структуры города. Жители начинают замечать положительные изменения в атмосфере и своем самочувствии.",
                    technical_details: {
                        recovery: "Восстановление энергетической инфраструктуры",
                        effects: "Улучшение экологии и психологического климата",
                        monitoring: "Постоянный контроль баланса"
                    },
                    character_state: "Заботливый целитель, восстанавливающий гармонию"
                },
                {
                    scene_number: 16,
                    title: "Поиск Нового Проекта",
                    date: "2025-10-16",
                    time: "11:00",
                    location: "Коворкинг 'Лофт', Нижний Новгород",
                    description: "Вугар возвращается к профессиональной деятельности. Просматривает предложения на hh.ru и получает приглашение на позицию Middle Node.js разработчика с окладом от 220 тысяч рублей.",
                    technical_details: {
                        platform: "hh.ru",
                        position: "Middle Node.js Developer",
                        salary: "от 220 000 руб.",
                        company: "ТехноМаг",
                        requirements: ["NestJS", "PostgreSQL", "Docker", "Микросервисы"]
                    },
                    character_state: "Профессионально заинтересованный, оценивающий перспективы"
                },

                {
                    scene_number: 16,
                    title: "Встреча",
                    date: "2025-10-20",
                    time: "18:14",
                    location: "Стрелка",
                    description: "Вугар встречается со Свет.",
                    technical_details: {
                        event: "Встреча",
                        participants: "Свет",
                        magic_effect: "Гармонизация энергии пространства через симбиоз"
                    },
                    character_state: "Раскованный, элегантный, наслаждающийся миром"
                },
                {
                    scene_number: 17,
                    title: "Осенний Бал",
                    date: "2025-10-29",
                    time: "20:00",
                    location: "Бальный зал, Нижний Новгород",
                    description: "Вугар посещает первый бал после восстановления баланса. Его присутствие гармонизирует пространство, а танцы с девушками создают волны позитивной энергии.",
                    technical_details: {
                        event: "Осенний благотворительный бал",
                        participants: "Девушки города",
                        magic_effect: "Гармонизация социальной энергии через танец"
                    },
                    character_state: "Раскованный, элегантный, наслаждающийся миром"
                },
                {
                    scene_number: 18,
                    title: "Мост Между Мирами",
                    date: "2025-10-20",
                    time: "18:00",
                    location: "Нижегородский кремль",
                    description: "Вугар обучает людей основам взаимодействия с астральным планом. Демонстрирует, как технологии могут усиливать магию и наоборот.",
                    technical_details: {
                        role: "Мост между физическим и астральным",
                        education: "Обучение межплоскостному взаимодействию",
                        integration: "Симбиоз технологий и магии"
                    },
                    character_state: "Мудрый наставник нового времени"
                },
                {
                    scene_number: 17,
                    title: "Оффер и Принятие Решения",
                    date: "2025-10-23",
                    time: "12:00",
                    location: "Квартира Вугара",
                    description: "Вугар получает оффер от компании 'ТехноМаг' с окладом 230 тысяч рублей. Обдумывает предложение, учитывая необходимость баланса между магическими обязанностями и профессиональной деятельностью.",
                    technical_details: {
                        offer: "Официальное предложение о работе",
                        salary: "230 000 руб.",
                        conditions: ["Удаленная работа", "Гибкий график", "Медицинская страховка"],
                        decision: "Принятие оффера"
                    },
                    character_state: "Взвешенный, принимающий стратегическое решение"
                },
            ],
            '5': [
                {
                    scene_number: 19,
                    title: "Подготовка к Зиме",
                    date: "2025-11-15",
                    time: "14:00",
                    location: "Нижегородский кремль",
                    description: "Вугар начинает подготовку к зимнему периоду, укрепляя защитные барьеры вокруг города и устанавливая связь с зимними божествами.",
                    technical_details: {
                        activity: "Укрепление защитных систем",
                        deities: ["Мороз", "Зима", "Снегурочка"],
                        preparations: "Энергетическая стабилизация на зимний период"
                    },
                    character_state: "Стратегическое планирование"
                },
                {
                    scene_number: 20,
                    title: "Зимнее Равноденствие",
                    date: "2025-12-21",
                    time: "18:00",
                    location: "Древнее капище на берегу Волги",
                    description: "Вугар проводит ритуал зимнего солнцестояния, балансируя энергии в точке годового цикла. Понимает, что баланс - это непрерывный процесс.",
                    technical_details: {
                        ritual: "Сезонная балансировка энергий",
                        cycle: "Годовой цикл мироздания",
                        maintenance: "Постоянное поддержание баланса"
                    },
                    character_state: "Понимающий цикличность хранитель"
                },
                {
                    scene_number: 21,
                    title: "Новогоднее Чудо",
                    date: "2025-12-31",
                    time: "23:59",
                    location: "Площадь Минина и Пожарского",
                    description: "В момент наступления Нового года Вугар создает магический щит, защищающий город на весь следующий год.",
                    technical_details: {
                        achievement: "Годовой защитный щит",
                        duration: "365 дней",
                        power: "Максимальная защита"
                    },
                    character_state: "Торжественное завершение года"
                }
            ],
            '6': [
                {
                    scene_number: 22,
                    title: "Новое Начало",
                    date: "2026-01-01",
                    time: "00:01",
                    location: "Нижегородский кремль",
                    description: "С первыми минутами нового года Вугар чувствует обновление энергии и начало нового цикла мироздания.",
                    technical_details: {
                        cycle: "Новый годовой цикл",
                        energy: "Обновленная магическая сила",
                        prospects: "Новые возможности"
                    },
                    character_state: "Обновленный и вдохновленный"
                },
                {
                    scene_number: 23,
                    title: "Полная Гармония",
                    date: "2026-02-26",
                    time: "12:00",
                    location: "Центр Вселенной",
                    description: "Достигнут абсолютный баланс и полная гармония во вселенной. Все миры - Явь, Правь и Навь - существуют в идеальной синхронизации.",
                    technical_details: {
                        achievement: "Полная гармония вселенной",
                        status: "Абсолютный баланс",
                        realms_sync: "100%",
                        energy_flow: "Идеально сбалансирован"
                    },
                    character_state: "Просветленный Хранитель, достигший высшего состояния бытия"
                },
                {
                    scene_number: 24,
                    title: "Наследие Вечности",
                    date: "2026-03-15",
                    time: "12:00",
                    location: "Школа хранителей",
                    description: "Вугар открывает школу для нового поколения. Передает знания о балансе физического и астрального, технологиях и магии как единой системе.",
                    technical_details: {
                        initiative: "Создание системы преемственности",
                        curriculum: ["Основы межплоскостного взаимодействия", "Архитектура реальности"],
                        legacy: "Передача знаний следующему поколению"
                    },
                    character_state: "Мудрый наставник, обеспечивающий будущее"
                },
                {
                    scene_number: 25,
                    title: "Вечный Страж Баланса",
                    date: "2026-03-31",
                    time: "00:00",
                    location: "Межмировое пространство",
                    description: "Вугар принимает свою роль как постоянного стража баланса. Наблюдает за всеми тремя мирами, обеспечивая их гармоничное взаимодействие.",
                    technical_details: {
                        status: "Перманентный страж баланса",
                        monitoring: "Непрерывное наблюдение за мирами",
                        integration: "Полное слияние с архитектурой реальности"
                    },
                    character_state: "Просветленный, ставший частью системы мироздания"
                }
            ]
        };

        return scenesDatabase[act] || [];
    }

    private getActTitle(act: string): string {
        const titles = {
            '1': 'ПРОБУЖДЕНИЕ КРОВИ',
            '2': 'ДОРОГА К БОГАМ',
            '3': 'БИТВА ЗА РУСЬ',
            '4': 'НОВАЯ ЭРА',
            '5': 'ЗИМНИЙ ПУТЬ',
            '6': 'ВЕЧНОЕ НАСЛЕДИЕ'
        };
        return titles[act] || 'Неизвестный акт';
    }

    private getActPeriod(act: string): string {
        const periods = {
            '1': 'Апрель - Май 2025',
            '2': 'Май 2025',
            '3': 'Июнь 2025',
            '4': 'Октябрь 2025',
            '5': 'Октябрь - Декабрь 2025',
            '6': 'Январь - Март 2026'
        };
        return periods[act] || 'Неизвестный период';
    }
}