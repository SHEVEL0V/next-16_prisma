# ═══════════════════════════════════════════════════════════
# Stage 1 — Dependencies
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# ═══════════════════════════════════════════════════════════
# Stage 2 — Build
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
# Stage 3 — Runner
# Cloud Run: PORT задається платформою (default 8080)
# ═══════════════════════════════════════════════════════════
FROM node:24.1-alpine3.20 AS runner

RUN apk add --no-cache tini wget

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/generated       ./generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma    ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma   ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# entrypoint.sh — запускає міграцію, потім сервер
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER balu

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]
