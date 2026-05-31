# ─────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─────────────────────────────────────────
# Stage 2 — Build application
# ─────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ─────────────────────────────────────────
# Stage 3 — Minimal production runner
# ─────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Static assets
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# Prisma schema + конфіг v7
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/generated       ./generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Prisma client і CLI
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma    ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma   ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

USER nextjs
EXPOSE 3000

# ФІНАЛЬНА КОМАНДА ДЛЯ PRISMA V7 + NEXT.JS STANDALONE
# 1. Тимчасово підміняємо DATABASE_URL на DIRECT_URL (порт 5432) суворо для міграції
# 2. Якщо міграція успішна (&&), запускаємо автономний сервер Next.js
CMD ["sh", "-c", "DATABASE_URL=$DIRECT_URL ./node_modules/.bin/prisma migrate deploy && node server.js"]
