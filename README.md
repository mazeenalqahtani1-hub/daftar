# دفتر — Daftar

دفتر ديون رقمي ذكي يربط المتاجر بالعملاء ويستبدل الدفاتر الورقية.
A digital debt ledger connecting merchants and customers.

> **Status: Phase 0 — project foundation only.** There are no product features yet
> (no auth, POS, QR, ledger, payments or notifications) and no application tables.
> See [docs/architecture.md](docs/architecture.md) for the roadmap.

## Stack

TypeScript · React 19 + Vite PWA · TanStack Router/Query · Tailwind 4 · Hono + Zod · PostgreSQL + Supabase ·
pnpm + Turborepo · Vitest · ESLint · Prettier · dependency-cruiser · GitHub Actions
(Playwright and pgTAP arrive with their first real flows.)

## Structure

```
apps/web      customer & merchant PWA
apps/api      thin HTTP API (validates, authorizes, calls PostgreSQL functions)
apps/worker   background worker (skeleton)
packages/shared   env validation helpers, logger, constants
packages/db       database layer (placeholder until Phase 1)
packages/config   shared tsconfig presets
supabase/     local Supabase config, migrations/, tests/
docs/         architecture, security, ADRs
```

## Requirements

- Node.js ≥ 22.12 (`.nvmrc`)
- pnpm (version pinned in `package.json` → `packageManager`)
- Docker (only for the local Supabase stack)

## Getting started

```bash
pnpm install
cp .env.example .env        # then fill in real local values (never commit .env)
pnpm dev                    # web :5173, api :8787, worker
```

Local database (needs Docker):

```bash
pnpm db:start               # prints the local URL, anon key and service-role key for your .env
pnpm db:stop
```

## Scripts

| Command                                      | Purpose                         |
| -------------------------------------------- | ------------------------------- |
| `pnpm dev`                                   | run web, api and worker         |
| `pnpm lint` / `typecheck` / `test` / `build` | via Turborepo                   |
| `pnpm format` / `format:check`               | Prettier                        |
| `pnpm check:boundaries`                      | dependency-cruiser import rules |
| `pnpm check:secrets`                         | secret hygiene guard            |
| `pnpm check`                                 | everything above, as in CI      |

## Ground rules

- The database is the source of truth for money and permissions.
- The browser never writes financial data; all writes go API → PostgreSQL functions.
- Ledger is append-only; money is integer halalas.
- No `localStorage` for money, debts or balances. No mock/seed data that imitates real data in production.
- Never commit `.env*` files or keys. Only `.env.example` is tracked.

Decisions are recorded in [docs/adr](docs/adr/README.md). Security notes: [docs/security.md](docs/security.md).
