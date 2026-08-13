# API Testing Guide (Swagger)

Актуальная документация для ручного тестирования API перед деплоем.

## База

- Base URL (локально): `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api`
- API prefix: `/reality`
- Формат: `application/json`

## Быстрый smoke-тест через Swagger

1. `POST /reality/auth/register`
2. `GET /reality/auth/confirm-email?token=...`
3. `POST /reality/auth/login`
4. Скопировать `data.accessToken`
5. Нажать `Authorize` в Swagger и вставить `Bearer <accessToken>`
6. Проверить:
   - `GET /reality/auth/me`
   - `GET /reality/gods`
   - `POST /reality/gods/oracle`
   - `POST /reality/rituals/perform`
   - `GET /reality/rituals/history`
   - `POST /reality/support`
   - `GET /reality/support`

## Endpoint Matrix

| Группа | Метод | Endpoint | JWT |
|---|---|---|---|
| auth | POST | `/reality/auth/register` | нет |
| auth | GET | `/reality/auth/confirm-email` | нет |
| auth | POST | `/reality/auth/login` | нет |
| auth | POST | `/reality/auth/logout` | да |
| auth | GET | `/reality/auth/me` | да |
| gods | GET | `/reality/gods` | нет |
| gods | POST | `/reality/gods/oracle` | опционально |
| gods | GET | `/reality/oracle/history` | да |
| rituals | GET | `/reality/rituals/types` | нет |
| rituals | POST | `/reality/rituals/perform` | опционально |
| rituals | GET | `/reality/rituals/history` | да |
| support | POST | `/reality/support` | опционально |
| support | GET | `/reality/support` | да |

## Аутентификация

### POST `/reality/auth/register`

Регистрирует пользователя, возвращает `userId` и ссылку подтверждения email.

Пример body:

```json
{
  "email": "user@example.com",
  "displayName": "Странник",
  "password": "Secret123!"
}
```

### GET `/reality/auth/confirm-email?token=...`

Подтверждает email.

### POST `/reality/auth/login`

Возвращает JWT:

```json
{
  "email": "user@example.com",
  "password": "Secret123!"
}
```

### POST `/reality/auth/logout` (JWT)

Завершает сессию.

### GET `/reality/auth/me` (JWT)

Возвращает профиль текущего пользователя.

## Пантеон и оракул

### GET `/reality/gods`

Список богов для UI.

Примечание:

- список формируется из backend-констант;
- в актуальном пантеоне есть `posvist` (Посвист) и другие боги;
- всегда берите допустимые `godName` именно из этого endpoint-а перед тестами.

### POST `/reality/gods/oracle` (JWT optional)

Пример body:

```json
{
  "godName": "veles",
  "intention": "Какое направление выбрать в ближайший месяц?",
  "userId": "usr_123"
}
```

`userId` можно не передавать при авторизации по JWT.

### GET `/reality/oracle/history` (JWT)

История обращений к оракулу.

## Ритуалы

### GET `/reality/rituals/types`

Список типов ритуалов.

### POST `/reality/rituals/perform` (JWT optional)

Пример body:

```json
{
  "godName": "perun",
  "ritualType": "blessing",
  "person": "Иван Иванов",
  "invokerId": "usr_123"
}
```

Примечания:

- `intensity` опционально, по умолчанию `76`.
- `location` опционально, по умолчанию `Священная роща`.
- при JWT `invokerId` можно не передавать.
- для обычных пользователей ритуал идёт на модерацию (`30-60` минут).
- для администратора `vugarguliev333@gmail.com` ритуал исполняется сразу.

### GET `/reality/rituals/history` (JWT)

История ритуалов текущего пользователя со статусами:

- `submitted_for_review`
- `accepted_for_execution`
- `rejected`
- `completed`

## Поддержка

### POST `/reality/support` (JWT optional)

Создаёт обращение модератору.

Пример body для гостя:

```json
{
  "displayName": "Гость",
  "email": "guest@example.com",
  "subject": "Вопрос по ритуалу",
  "message": "Подскажите, почему ритуал отклонён?"
}
```

При JWT `displayName` и `email` берутся из профиля.

### GET `/reality/support` (JWT)

История обращений пользователя.

## Ошибки и коды

Типовые коды:

- `400` — валидация/некорректные данные
- `401` — нет/невалидный JWT
- `404` — сущность не найдена
- `409` — конфликт (например, email уже существует)
- `503` — временная недоступность зависимостей

## Security Note

- Никогда не публикуйте в docs реальные production credentials (`POSTGRES_PASSWORD`, full DB URL, tokens).
- Для примеров используйте только плейсхолдеры вида `<db-password>`, `<access-token>`.

## Полезно перед деплоем

Запустить:

```bash
npm run lint
npm run test
npm run build
npm run build:frontend
```

Интерактивная проверка всех endpoint-ов выполняется через Swagger: `http://localhost:3000/api`.
