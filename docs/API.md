# API Reference — Slavic Reality System

Базовый URL (локально): `http://localhost:3000`

| Параметр | Значение |
|----------|----------|
| Префикс Reality API | `/reality` |
| Swagger (Reality) | [http://localhost:3000/api](http://localhost:3000/api) |
| Формат | JSON (`Content-Type: application/json`) |
| Кодировка | UTF-8 |

---

## Общий формат ответов

### Успех

Большинство эндпоинтов возвращают обёртку:

```json
{
  "success": true,
  "message": "Текст для пользователя",
  "data": { },
  "timestamp": "2026-06-09T12:00:00.000Z"
}
```

Дополнительные поля по контексту: `guidance`, `blessing`, `wisdom`, `effect`, `persistence`.

### Ошибка

Глобальный фильтр `SlavicExceptionFilter` (`src/common/filters/slavic-exception.filter.ts`):

```json
{
  "success": false,
  "message": "Описание ошибки",
  "timestamp": "2026-06-09T12:00:00.000Z",
  "path": "/reality/...",
  "slavicWisdom": "Народная мудрость по коду статуса",
  "guidance": "Что делать",
  "nextSteps": ["шаг 1", "шаг 2"]
}
```

| HTTP | Типичная причина |
|------|------------------|
| `400` | Валидация DTO, просроченный токен email |
| `404` | Бог / персонаж / акт не найден |
| `409` | Email уже зарегистрирован |
| `503` | MySQL недоступна, ИИ-оракул не настроен |

---

## Reality API

### Аутентификация и пользователи

#### `POST /reality/auth/register`

Регистрация пользователя. **Требует MySQL.**

**Тело запроса:**

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `email` | string | да | Валидный email |
| `displayName` | string | да | Имя в системе |
| `password` | string | да | Минимум 8 символов |

**Пример:**

```bash
curl -X POST http://localhost:3000/reality/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","displayName":"Странник","password":"Secret123!"}'
```

**Ответ `201`:** `data.userId`, `data.email`, `data.emailConfirmed: false`.

**Примечание:** ссылка подтверждения пишется в **лог сервера**, SMTP не подключён.

---

#### `GET /reality/auth/confirm-email?token={token}`

Подтверждение email по токену из «письма». **Требует MySQL.**

**Query:** `token` — hex-строка (64 символа).

**Ответ `200`:** `data.emailConfirmed: true`.

---

### Боги и ИИ

#### `GET /reality/gods`

Список пантеона (18 божеств).

**Ответ `200`:**

```json
{
  "success": true,
  "count": 18,
  "aiOracleEnabled": true,
  "data": [
    {
      "id": "veles",
      "name": "Велес",
      "domain": "Мудрость и Магия",
      "element": "земля",
      "description": "...",
      "preferredOfferings": ["книги", "травы"],
      "symbols": ["медведь", "посох"],
      "realms": ["Явь", "Навь", "Правь"]
    }
  ],
  "timestamp": "..."
}
```

**Допустимые `godName` / `id`:**  
`belobog`, `chernobog`, `perun`, `mokosh`, `veles`, `vyshen`, `dazhbog`, `lada`, `svarog`, `stribog`, `morana`, `yarilo`, `kupala`, `rod`, `simargl`, `khors`, `zorya`, `triglav`.

---

#### `POST /reality/gods/contact`

Установление контакта с богом: проверка подношения, дар, опционально ИИ-пророчество.

**Тело запроса:**

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `userId` | string | да | ID пользователя/духа |
| `godName` | string | да | ID из пантеона |
| `offering.type` | string | да | Тип подношения |
| `offering.purity` | number | да | 0–100 |
| `offering.significance` | number | да | 0–100 |
| `intention` | string | да | Намерение |

**Правила готовности** (`GodsService`): `purity >= 70`, `significance >= 50`, не более 3 контактов за час на `userId`.

**Пример:**

```bash
curl -X POST http://localhost:3000/reality/gods/contact \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "vugar_guliev_1996",
    "godName": "veles",
    "offering": { "type": "мёд", "purity": 85, "significance": 90 },
    "intention": "получение мудрости"
  }'
```

**Ответ `201` — `data`:**

| Поле | Описание |
|------|----------|
| `god` | Имя бога |
| `connectionStrength` | 0–100 |
| `message` | Шаблонное послание |
| `gift` | Дар (руна, эффект, благословение) |
| `duration` | Длительность связи |
| `oracle` | `null` или `{ prophecy, model, generatedAt }` |

---

#### `POST /reality/gods/oracle`

Только ИИ-пророчество (без полного ритуала контакта). **Требует `OPENAI_API_KEY`.**

**Тело запроса:**

| Поле | Тип | Обязательно |
|------|-----|-------------|
| `godName` | string | да |
| `intention` | string | да |
| `userId` | string | нет |
| `offering.type` | string | нет |
| `offering.purity` | number | нет |
| `offering.significance` | number | нет |

**Пример:**

```bash
curl -X POST http://localhost:3000/reality/gods/oracle \
  -H "Content-Type: application/json" \
  -d '{"godName":"perun","intention":"защити мой путь","userId":"stranger_1"}'
```

**Ответ `200`:**

```json
{
  "success": true,
  "message": "Перун отвечает страннику",
  "data": {
    "god": "Перун",
    "godId": "perun",
    "oracle": {
      "prophecy": "Текст пророчества...",
      "model": "gpt-4o-mini"
    }
  }
}
```

---

### Игровая механика

#### `POST /reality/awaken-bloodline`

| Поле | Тип | Обязательно |
|------|-----|-------------|
| `userId` | string | да |
| `location` | string | да |
| `heirloom` | string | да |
| `ancestralMemory` | object | нет |

---

#### `POST /reality/balance/create`

| Поле | Тип | Диапазон |
|------|-----|----------|
| `location` | string | — |
| `lightEnergy` | number | 0–100 |
| `darknessEnergy` | number | 0–100 |
| `creatorId` | string | — |

---

#### `POST /reality/rituals/perform`

| Поле | Тип | Значения |
|------|-----|----------|
| `ritualType` | string | `purification`, `blessing`, `consecration`, `weaving`, `coition`, `offer` |
| `person` | string | Для кого ритуал |
| `location` | string | Место |
| `intensity` | number | 1–100 |
| `invokerId` | string | ID заклинателя |

---

#### `GET /reality/character/:id`

Профиль персонажа. Сейчас доступен только `vugar_guliev`.

---

#### `GET /reality/scenes/:act`

Сцены сюжета по номеру акта (`1`–`6`). Акт `1` содержит данные; остальные — пустой список → `404`.

---

#### `PUT /reality/skills/upgrade`

| Поле | Тип | Описание |
|------|-----|----------|
| `userId` | string | ID пользователя |
| `skills` | string[] | Минимум 1 навык |
| `energyCost` | number | 1–100 |

При доступной MySQL пишет лог в `skill_upgrade_logs`.

---

#### `GET /reality/status`

Статус «мироздания» (статические данные + timestamp).

---

## Messaging API (микросервисы)

Запускаются отдельно от Reality API.

### Producer — порт `3001`

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/events` | Публикация события в RabbitMQ |
| `GET` | `/health` | Health check |

**Swagger:** `http://localhost:3001/docs`

**Тело `POST /events`:**

```json
{
  "type": "order.created",
  "payload": { "orderId": 42, "total": 1500 }
}
```

**Ответ `202`:** объект `DomainEvent`:

```json
{
  "id": "uuid",
  "type": "order.created",
  "timestamp": "ISO-8601",
  "payload": { }
}
```

---

### Consumer — порт `3002`

| Метод | Путь |
|-------|------|
| `GET` | `/health` |

Читает очередь `events.processing`, публикует в очередь уведомлений.

---

### Telegram — порт `3003`

| Метод | Путь |
|-------|------|
| `GET` | `/health` |

Читает очередь уведомлений, шлёт в Telegram Bot API.

**Переменные:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

---

## Frontend → API (используемые методы)

Клиент: `frontend/src/lib/api/reality.api.ts`

| Метод UI | HTTP |
|----------|------|
| Пантеон (локально) | — (`data/gods.ts`) |
| Контакт | `POST /reality/gods/contact` |
| Оракул | `POST /reality/gods/oracle` |
| Ритуал | `POST /reality/rituals/perform` |
| Регистрация | `POST /reality/auth/register` |
| Статус | `GET /reality/status` |

В production задайте `VITE_API_URL` (полный URL API без `/reality`) или разместите фронт за reverse proxy с тем же origin.

---

## Коды и ограничения

| Ограничение | Где |
|-------------|-----|
| Подношение: purity ≥ 70, significance ≥ 50 | `GodsService` |
| ≤ 3 контакта/час на userId | `GodsService` |
| Пароль ≥ 8 символов | `RegisterUserDto` |
| Токен email: 24 ч | `RealityService.registerUser` |
| ИИ: `OPENAI_MAX_TOKENS` (default 700) | `AiConfigService` |

---

*Интерактивная спецификация: Swagger на `:3000/api`. Архитектура: [ARCHITECTURE.md](./ARCHITECTURE.md).*
