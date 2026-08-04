# Nest.js Microservices with RabbitMQ and Telegram

Проект реализует микросервисную архитектуру на Nest.js:

- `producer` — HTTP сервис для публикации событий в RabbitMQ
- `consumer` — сервис обработки входящих событий с retry/ack логикой
- `telegram` — сервис уведомлений через Telegram Bot API

## Архитектура

Пайплайн событий:

1. Клиент отправляет событие в `producer` через `POST /events`
2. `producer` присваивает событию UUID, сериализует в JSON и публикует в RabbitMQ через `confirm channel`
3. `consumer` читает из очереди `events.processing`, обрабатывает и проксирует событие в очередь уведомлений
4. `telegram` читает уведомления и отправляет сообщение в Telegram Bot API

### Clean Architecture

Для микросервисного контура используется разделение на слои:

- `application` — use-cases (бизнес-сценарии)
- `application/ports` — интерфейсы зависимостей (контракты)
- `infrastructure/adapters` — реализации портов (RabbitMQ, Telegram API)
- `controllers` — входные HTTP точки

### Надежность

- Идемпотентность через `messageId = event.id (UUID)`
- Подтверждение отправки через `waitForConfirms()`
- Ретраи подключения к RabbitMQ
- Ретраи обработки в `consumer` (через `x-retry-count`)
- Финальный fallback в очередь `events.failed`
- Логирование успешных и неуспешных обработок

## Переменные окружения

Скопируйте пример:

```bash
cp .env.example .env
```

Заполните значения:

- `RABBITMQ_URL`
- `PRODUCER_PORT`
- `CONSUMER_MAX_RETRIES`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Локальный запуск (без Docker)

```bash
npm install
npm run start:producer:dev
npm run start:consumer:dev
npm run start:telegram:dev
```

Swagger для producer:

- `http://localhost:3001/docs`
Swagger для consumer:

- `http://localhost:3002/docs`
Swagger для telegram:

- `http://localhost:3003/docs`

Health-check endpoints:

- Producer: `GET http://localhost:3001/health`
- Consumer: `GET http://localhost:3002/health`
- Telegram: `GET http://localhost:3003/health`

Проверка отправки события:

```bash
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"order.created\",\"payload\":{\"orderId\":123,\"total\":1500}}"
```

## Запуск через Docker

```bash
docker compose up --build
```

Сервисы:

- Producer: `http://localhost:3001`
- RabbitMQ UI: `http://localhost:15672` (`guest/guest`)

## Тесты

```bash
npm run test
npm run test:e2e
```

Добавлены тесты:

- unit: создание события с UUID/timestamp и вызов publish-порта
- e2e: полный поток `producer -> consumer -> telegram` через in-memory adapters