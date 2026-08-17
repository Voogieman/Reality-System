FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY frontend/package*.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend

COPY . .
RUN npm run build && npm run build:frontend

FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/frontend/dist ./frontend/dist

CMD ["node", "dist/main.js"]
