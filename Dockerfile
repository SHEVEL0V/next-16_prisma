# ═══════════════════════════════════════════════════════════
# Stage 1 — deps
# Встановлення залежностей (кешований шар)
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# Встановлюємо ВСІ залежності (включно з dev) — потрібні для prisma generate та tsc
RUN npm ci --ignore-scripts


# ═══════════════════════════════════════════════════════════
# Stage 2 — builder
# Генерація Prisma Client + компіляція Next.js
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Отримуємо node_modules зі stage 1
COPY --from=deps /app/node_modules ./node_modules

# Копіюємо весь вихідний код
COPY . .

# Явно копіюємо Prisma (на випадок якщо є .dockerignore)
COPY prisma ./prisma

ENV NODE_ENV=production

# Генеруємо Prisma Client під Alpine (linux-musl бінарник)
RUN npx prisma generate

# Збираємо Next.js у standalone режимі
RUN npm run build


# ═══════════════════════════════════════════════════════════
# Stage 3 — runner
# Мінімальний production образ для Google Cloud Run
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS runner

# tini — коректний PID 1 (обробка сигналів, zombie reaping)
# wget  — health check probe
RUN apk add --no-cache tini wget

WORKDIR /app

# Запускаємо від непривілейованого користувача
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

ENV NODE_ENV=production
# Cloud Run динамічно призначає PORT (зазвичай 8080),
# але може бути іншим — тому читаємо зі змінної середовища
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# ── Статика та standalone сервер Next.js ──────────────────
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# ── Prisma: схема + конфіг ────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# ── Prisma CLI (потрібні для migrate deploy при старті) ───
# Prisma 7+ НЕ використовує node_modules/.prisma —
# client генерується у ./generated/prisma (згідно prisma.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma       ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma      ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma  ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/typescript   ./node_modules/typescript

# ── Згенерований Prisma Client (Prisma 7: ./generated/prisma) ──
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated

USER nextjs

# Документуємо порт (Cloud Run читає EXPOSE як підказку)
EXPOSE 8080

# tini як entrypoint — коректно форвардить сигнали до node
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "server.js"]
