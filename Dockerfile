# ═══════════════════════════════════════════════════════════
# Stage 1 — Dependencies (Встановлення всіх пакетів для збірки)
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
# Встановлюємо devDependencies для успішної перевірки типів TypeScript
RUN npm ci --ignore-scripts

# ═══════════════════════════════════════════════════════════
# Stage 2 — Build (Компіляція застосунку та генерація клієнта)
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# ═══════════════════════════════════════════════════════════
# Stage 3 — Runner (Мінімальний образ для Google Cloud Run)
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS runner
RUN apk add --no-cache tini wget
WORKDIR /app
ENV NODE_ENV=production


# Копіюємо статичні асети та автономну збірку Next.js
COPY --from=builder /app/public          ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static    ./.next/static

# Копіюємо конфігурацію та схему Prisma v7
COPY --from=builder /app/prisma          ./prisma
COPY --from=builder /app/generated       ./generated
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Копіюємо бінарники CLI для виконання міграцій перед стартом
COPY --from=builder /app/node_modules/prisma    ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma   ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Налаштування та копіювання скрипту запуску
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Google Cloud Run динамічно використовує порт 8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]
