# Документация Magic13 (Slavic Reality System)

Навигация по документам проекта.

| Документ | Для кого | Содержание |
|----------|----------|------------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Разработчики | Архитектура, компоненты, пантеон, ИИ, диаграммы |
| **[API.md](./API.md)** | Frontend / интеграторы | Все REST-эндпоинты, примеры curl, форматы ответов |
| **[PRODUCTION.md](./PRODUCTION.md)** | DevOps / тимлид | Что доработать перед продакшеном, чеклист, план |
| **[ORACLE.md](./ORACLE.md)** | AI / контент | Мифологические промпты, профиль Велеса, настройка оракула |

## Быстрые ссылки

| Ресурс | URL (локально) |
|--------|----------------|
| Frontend | http://localhost:5173 |
| Reality API | http://localhost:3000 |
| Swagger | http://localhost:3000/api |
| Producer | http://localhost:3001/docs |
| RabbitMQ UI | http://localhost:15672 |

## Запуск

```bash
cp .env.example .env
npm install
npm run start:dev          # API :3000
npm run start:frontend     # UI :5173
```

Подробнее — в корневом [readme.md](../readme.md) (messaging) и [ARCHITECTURE.md](./ARCHITECTURE.md) (полная картина).
