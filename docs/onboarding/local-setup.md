# Local Development Setup — Navya

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | >= 20.10.0 | Use nvm or fnm |
| npm | >= 10.0.0 | Bundled with Node 20+ |
| Docker Desktop | Latest | Supabase CLI uses it under the hood |

## Quick Start

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set up environment (first time only)

```bash
cp .env.example .env.local
```

### 3. Start everything

```bash
npm run dev
```

This starts Supabase (database, auth, API, Studio) and the Expo dev server together. First run takes ~2 minutes as it pulls Docker images.

### 4. Reset database (when schema changes)

```bash
npm run db:reset
```

Applies all migrations, seeds default data, and regenerates TypeScript types.

### 5. Stop Supabase

```bash
npm run db:stop
```

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Supabase + Expo together |
| `npm run db:reset` | Fresh database with migrations, seed, and types |
| `npm run db:stop` | Stop Supabase containers |

## Verify Setup

- **Supabase Studio**: http://localhost:54323
- **Inbucket (local email)**: http://localhost:54324
- **TypeScript check**: `npm run typecheck`

## Troubleshooting

### Port already in use

```bash
lsof -i :54321
lsof -i :54322
lsof -i :54323
```

Stop the conflicting process or change ports in `supabase/config.toml`.

### Docker Desktop not running

Ensure Docker Desktop is running with at least 4 GB RAM allocated.

### Types out of sync

Run `npm run db:reset` to regenerate types from the local schema.

### Expo can't connect to Supabase

Ensure `.env.local` has `EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321` and Supabase is running.
