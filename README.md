# Kanban Board — Next.js Application

A modern, full-stack Kanban board built with **Next.js 16**, **React 19**, **TypeScript**, and **Prisma ORM**. Features drag-and-drop task management, secure JWT authentication, and a responsive Material-UI interface.

## 🌐 Live Demo

**[https://board-808925023135.europe-west1.run.app](https://board-808925023135.europe-west1.run.app)**

> Hosted on Render (free tier — first load may take ~30s to wake up)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Installation

```bash
# Clone repository
git clone https://github.com/SHEVEL0V/next-16_prisma.git
cd next-16_prisma

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Run development server
npm run dev
```

Server runs at `http://localhost:3000`

---

## 🎯 Key Features

- **Drag-and-Drop** — seamless task and column reordering
- **Authentication** — secure JWT with bcrypt password hashing
- **Type-Safe** — full TypeScript with Zod validation
- **Modern UI** — Material-UI with Emotion styling
- **Optimistic Updates** — instant UI feedback with `useOptimistic`
- **SSR-safe** — server-side rendering with Next.js App Router

---

## 🛠️ Technology Stack

| Tech        | Version | Purpose                      |
| ----------- | ------- | ---------------------------- |
| Next.js     | 16      | React framework (App Router) |
| React       | 19      | UI library                   |
| TypeScript  | 5       | Type safety                  |
| Prisma      | 7       | ORM                          |
| PostgreSQL  | 16      | Database                     |
| Material-UI | 7       | Component library            |
| Jose        | 6       | JWT encryption               |
| Zod         | 4       | Schema validation            |
| bcrypt      | 6       | Password hashing             |

---

## 📋 Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/kanban_db"

# Session secret (min 32 chars) — generate: openssl rand -base64 32
SESSION_SECRET="your-session-secret-min-32-chars"

# Auth secrets (min 32 chars each)
AUTH_SECRET="your-auth-secret-min-32-chars"
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_EXPIRATION_DAYS=7

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages and layouts (App Router)
├── components/             # Shared UI components
├── constants/              # Application-wide constants
├── dictionaries/           # Localization dictionaries
├── features/               # Feature-based modules
├── hooks/                  # Shared React hooks
├── lib/                    # Client libraries (Prisma, etc.)
├── theme/                  # Material-UI theme configuration
├── types/                  # Global TypeScript types
├── utils/                  # Helper utilities
└── proxy.ts                # Proxy configuration

prisma/
├── models/                 # Split Prisma model files
│   ├── auth.prisma
│   └── board.prisma
├── schema.prisma           # Main schema configuration
└── migrations/             # SQL migration history
```

---

## 🚀 Available Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint check
npm test             # Jest tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Coverage report
```

---

## 🐳 Deployment (Docker / Render)

The project includes a production-ready Docker setup.

### Run locally with Docker Compose

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, SESSION_SECRET, AUTH_SECRET, JWT_SECRET

docker compose up --build
```

### Deploy to Render

1. Push to GitHub
2. **Render Dashboard → New → Blueprint** — select your repo
3. Render reads `render.yaml` and provisions:
   - **Web Service** (Docker) — Next.js app
   - **PostgreSQL** — managed database with auto-injected `DATABASE_URL`
4. After first deploy, set secrets manually:
   ```
   Dashboard → kanban-app → Environment → Add Environment Variable
   SESSION_SECRET = <openssl rand -base64 32>
   AUTH_SECRET    = <openssl rand -base64 32>
   JWT_SECRET     = <openssl rand -base64 32>
   ```

---

## 🔒 Security

- **Bcrypt** password hashing (10 rounds)
- **JWT** session encryption (HS256)
- **HTTP-only** cookies with `SameSite=Lax`
- **Input validation** with Zod schemas
- **Server Actions** for all mutations

---

## 🧪 Tests

```
Test Suites: 17 passed
Tests:       273 passed
```

Covers: services, schemas, hooks, form components, modal components, utilities.

---

## 📄 License

This project is private and not for public distribution.

---

**Version**: 0.1.1
**Repository**: [SHEVEL0V/next-16_prisma](https://github.com/SHEVEL0V/next-16_prisma)
**Live**: [board-808925023135.europe-west1.run.app](https://board-808925023135.europe-west1.run.app)
**Last Updated**: 2026-06-01
