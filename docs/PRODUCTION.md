# Production / Render Deployment

Актуальный runbook для деплоя `Magic13` на Render.

## Архитектура на Render

- `PostgreSQL` (managed database)
- `Backend` (Web Service, Node/NestJS)
- `Frontend` (Static Site, Vite build)

## Backend Service (NestJS)

### Settings

- Environment: `Node`
- Root Directory: `/`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

### Required Environment Variables

- `NODE_ENV=production`
- `JWT_SECRET=<strong_secret>`
- `JWT_EXPIRES_IN=7d`
- `APP_BASE_URL=https://<backend-service>.onrender.com`
- `POSTGRES_HOST=<render-db-host>`
- `POSTGRES_PORT=<render-db-port>`
- `POSTGRES_USER=<render-db-user>`
- `POSTGRES_PASSWORD=<render-db-password>`
- `POSTGRES_DATABASE=<render-db-name>`

### Optional Environment Variables

- `OPENAI_API_KEY=<key>`
- `OPENAI_BASE_URL=https://api.proxyapi.ru/openai/v1`
- `OPENAI_MODEL=gpt-4o-mini`

### Health / smoke URLs

- API root: `https://<backend-service>.onrender.com/reality/gods`
- Swagger: `https://<backend-service>.onrender.com/api`

## Frontend Static Site (Vite)

### Settings

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

### Environment Variables

- `VITE_API_URL=https://<backend-service>.onrender.com`

## Pre-deploy Checks

Run from project root:

```bash
npm run lint
npm run test
npm run build
npm run build:frontend
```

## Post-deploy Verification

1. Open Swagger: `https://<backend-service>.onrender.com/api`
2. Execute auth flow:
   - `POST /reality/auth/register`
   - `GET /reality/auth/confirm-email?token=...`
   - `POST /reality/auth/login`
   - `Authorize` with `Bearer <accessToken>`
3. Verify protected endpoints:
   - `GET /reality/auth/me`
   - `GET /reality/rituals/history`
   - `GET /reality/oracle/history`
4. Create test ritual:
   - `POST /reality/rituals/perform`
5. Verify frontend:
   - login/logout
   - ritual submission
   - cabinet visibility

## Notes

- Admin email `vugarguliev333@gmail.com` bypasses ritual moderation.
- Backend listens on `process.env.PORT` (Render-compatible).
- Swagger is enabled in current build; if needed, restrict it later by environment.

