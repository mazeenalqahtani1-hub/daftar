# Architecture

> Status: **Phase 0** — foundation only. This document describes the target architecture and what exists today.

## 1. Principles

1. **The database is the source of truth** for money and permissions.
2. **No client writes to financial tables.** The browser reads; all writes go through the API and PostgreSQL functions.
3. **Append-only ledger**; balances are derived. Money is integer **halalas**.
4. **Defence in depth:** authorization in the API _and_ in the database (RLS + function checks).
5. **Thin API:** validation, auth, rate limits, idempotency — no financial logic.
6. **Feature-based, mechanically enforced boundaries** (dependency-cruiser).

## 2. Layers

```
UI (apps/web: shared/ui)                 generic components, no business logic
  ↓
Features (apps/web: features/*)          auth · pos · customer · merchant · catalog · staff · notifications
  ↓
Data/API layer (apps/web: shared/api-client, feature api/ + TanStack Query)
  ↓  HTTPS                               (reads under RLS via Supabase are used mainly for Realtime)
Server (apps/api: Hono + Zod)            validate · authorize · rate-limit · idempotency · webhooks
  ↓
Database (PostgreSQL / Supabase)         RLS · api.* functions · triggers · ledger · audit
Worker (apps/worker)                     outbox · expirations · reconciliation (same DB)
```

## 3. Repository layout (today)

```
apps/
  web/      React 19 + Vite PWA, TanStack Router (file-based) + Query, Tailwind 4
  api/      Hono + Zod (+ pino). /health only
  worker/   polling runner skeleton. no tasks yet
packages/
  shared/   env validation helpers (Zod), logger (server-only entry), constants
  db/       placeholder (schema names). typed client arrives in Phase 1
  config/   shared tsconfig presets
supabase/   local stack config, empty migrations/ and tests/
docs/       architecture, security, ADRs
scripts/    check-secrets.mjs
```

### apps/web

```
src/
  app/        providers, router, route files (routes/), styles, PWA registration
  features/   (empty) one folder per capability; only index.ts is public
  shared/     ui/ · lib/ · api-client/ · config/ (validated public env)
```

Routes are file-based under `src/app/routes/`; the generated `routeTree.gen.ts` is committed and excluded from lint/format.

### apps/api

```
src/
  app.ts          createApp(): pure factory (CORS allow-list, secure headers, body limit, request id, access log, error handler)
  server.ts       process entry: env → logger → app → listen → graceful shutdown
  infra/          env.ts (Zod contract). later: db, sms, push
  middleware/     request-id · access-log · errors
  modules/        (empty) routes.ts · service.ts · schemas.ts · index.ts per module
```

### apps/worker

`runner.ts` runs registered tasks sequentially on an interval; a failing task is logged and isolated.
Tasks (outbox, expiry, reconciliation) are registered from later phases.

## 4. Environment configuration

Each app validates **only its own** variables with Zod at startup and refuses to boot otherwise
(`apps/*/src/**/env.ts`, built on `@daftar/shared`'s `parseEnv`). Error messages list variable **names**, never values.

| App             | Variables                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| web (public)    | `VITE_APP_ENV`, `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`                                                                    |
| api (server)    | `NODE_ENV`, `API_PORT`, `API_LOG_LEVEL`, `API_ALLOWED_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` |
| worker (server) | `NODE_ENV`, `WORKER_LOG_LEVEL`, `WORKER_POLL_INTERVAL_MS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`                           |

`.env.example` is the only tracked env file. Real `.env*` files are git-ignored and CI verifies it.

## 5. Enforced boundaries (`pnpm check:boundaries`)

- No circular dependencies; no unresolvable imports.
- Apps never import apps; packages never import apps.
- `@daftar/shared` is a leaf; `@daftar/db` depends only on shared.
- `apps/web` cannot import server code: only _type-only_ imports from `@daftar/db`; never the server logger.
- Web: `shared/` ↛ `features/`/`app/`; `features/` ↛ `app/`; features ↔ features and `app/` → features only via `index.ts`.
- API: `infra/`, `middleware/` ↛ `modules/`; modules ↔ modules only via `index.ts`.

## 6. Target design (later phases)

- **Identity:** `profiles(id = auth.users.id, phone_e164 UNIQUE)`, `customers`; no global "role" column.
- **Tenancy & RBAC:** `stores`, `store_members`, `roles`, `permissions`, `role_permissions`; `app.has_store_permission(store_id, perm)`.
- **Commerce:** `products`, `categories`, `invoices`, `invoice_items`, `payments`, `payment_allocations`, `customer_accounts`.
- **Ledger:** `ledger_transactions` + append-only `ledger_entries` (signed halalas); balance projection maintained by trigger and reconciled.
- **Platform:** `qr_tokens`, `notifications` + outbox, `audit_logs`, `idempotency_keys`, `webhook_events`.
- **Postgres schemas:** `public` (tables, read via RLS), `api` (write functions, API only), `app` (internal helpers).

## 7. Roadmap

| Phase | Scope                                                                     |
| ----- | ------------------------------------------------------------------------- |
| **0** | **Foundation (this)**                                                     |
| 1     | Database foundation (identity, tenancy, RBAC, audit, RLS helpers) + pgTAP |
| 2     | Phone + OTP authentication, profile, create store, invitations            |
| 3     | Staff and catalog                                                         |
| 4     | Ledger and invoices (backend)                                             |
| 5     | QR and POS flow                                                           |
| 6     | Customer app and merchant debt management                                 |
| 7     | Notifications                                                             |
| 8     | Reports and hardening                                                     |
| 9     | Online payments and compliance                                            |
| 10    | Scale                                                                     |
