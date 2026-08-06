# Magic13 / Slavic Reality Portal

Портал на `NestJS + React` с JWT-авторизацией, ИИ-оракулом, ритуалами, личным кабинетом и поддержкой.

## Возможности

- JWT auth: регистрация, подтверждение email, вход, выход, профиль.
- Пантеон славянских богов и ИИ-оракул.
- Ритуалы с сохранением истории и статусами.
- Личный кабинет только для авторизованных пользователей.
- Поддержка (тикеты модератору).
- Swagger UI для тестирования API.

## Ритуалы и модерация

- Для обычных пользователей:
  - ритуал отправляется на модерацию;
  - окно проверки: `30-60` минут;
  - статусы: `отправлен на проверку` → `принят на реализацию`/`отклонён` → `выполнен`.
- Для администратора с email `vugarguliev333@gmail.com`:
  - ритуал исполняется сразу, без модерации.

## Стек

- Backend: `NestJS`, `TypeORM`, `PostgreSQL`, `JWT`, `Swagger`.
- Frontend: `React`, `Vite`, `TypeScript`, `react-router-dom`.

## Быстрый старт

### 1) Установка

```bash
npm install
npm install --prefix frontend
```

### 2) Переменные окружения

Создайте `.env` на основе `.env.example`.

Минимум:

- `PORT` (для Render и локального запуска, по умолчанию `3000`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `OPENAI_API_KEY` (если нужен ИИ-оракул)
- `OPENAI_BASE_URL` (опционально)
- `OPENAI_MODEL` (опционально)

### 3) Запуск

Backend:

```bash
npm run start:dev
```

Frontend:

```bash
npm run start:frontend
```

## Проверки перед деплоем

```bash
npm run lint
npm run test
npm run build
npm run build:frontend
```

## Swagger / тестирование API

После запуска backend:

- Swagger UI: `http://localhost:3000/api`

Быстрый сценарий теста в Swagger:

1. `POST /reality/auth/register`
2. `GET /reality/auth/confirm-email?token=...` (токен из ответа регистрации)
3. `POST /reality/auth/login` → взять `accessToken`
4. Нажать `Authorize` и вставить `Bearer <accessToken>`
5. Проверить защищённые методы:
   - `GET /reality/auth/me`
   - `GET /reality/rituals/history`
   - `GET /reality/oracle/history`
   - `GET /reality/support`

Основные endpoint-ы для ручного теста:

- `GET /reality/gods`
- `POST /reality/gods/oracle`
- `GET /reality/rituals/types`
- `POST /reality/rituals/perform`
- `POST /reality/support`

Подробная спецификация и примеры запросов: `docs/API.md`.

## Структура проекта

- `src/` — backend
  - `src/reality` — API controller/service
  - `src/rituals` — логика ритуалов
  - `src/database` — TypeORM и сущности
  - `src/auth` — JWT guard/strategy
- `frontend/` — frontend
  - `frontend/src/components`
  - `frontend/src/lib/api`
  - `frontend/src/data`

## Изображения богов

Папка: `frontend/src/assets/gods/`

Поддерживаемые форматы:

- `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`

Имя файла:

- по `id` бога (`veles.jpg`, `perun.webp`)
- или по русскому имени (`велес.jpg`, `перун.webp`)

Изображения подхватываются автоматически и плавно меняются в UI.

## Deploy на Render

Ниже минимально-рабочая схема: `PostgreSQL + Backend Web Service + Frontend Static Site`.

### 1) PostgreSQL (Render Database)

Создай PostgreSQL в Render и сохрани:

- `host`
- `port`
- `database`
- `user`
- `password`

### 2) Backend (Render Web Service)

- **Environment**: `Node`
- **Root Directory**: `/` (корень репозитория)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

Environment Variables:

- `NODE_ENV=production`
- `JWT_SECRET=<strong_secret>`
- `JWT_EXPIRES_IN=7d`
- `APP_BASE_URL=https://<your-backend>.onrender.com`
- `POSTGRES_HOST=<db-host>`
- `POSTGRES_PORT=<db-port>`
- `POSTGRES_USER=<db-user>`
- `POSTGRES_PASSWORD=<db-password>`
- `POSTGRES_DATABASE=<db-name>`
- `OPENAI_API_KEY=<key>` (если нужен ИИ-оракул)
- `OPENAI_BASE_URL=https://api.proxyapi.ru/openai/v1` (опционально)
- `OPENAI_MODEL=gpt-4o-mini` (опционально)

Swagger после деплоя:

- `https://<your-backend>.onrender.com/api`

### 3) Frontend (Render Static Site)

- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

Environment Variables:

- `VITE_API_URL=https://<your-backend>.onrender.com`

### 4) Smoke-test после деплоя

1. Открыть Swagger: `https://<your-backend>.onrender.com/api`
2. Пройти auth flow:
   - `POST /reality/auth/register`
   - `GET /reality/auth/confirm-email?token=...`
   - `POST /reality/auth/login`
   - `Authorize: Bearer <accessToken>`
3. Проверить:
   - `GET /reality/auth/me`
   - `POST /reality/rituals/perform`
   - `GET /reality/rituals/history`
4. Открыть frontend URL и проверить вход, оракул, ритуалы, кабинет.

