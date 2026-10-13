# 0001 — Supabase with a thin API; the database owns financial truth

**Status:** Accepted

## Context

Daftar handles debts and payments between merchants and customers. A previous prototype let the
browser write money-related rows directly, which made balances, status changes and permissions
unsafe. We need real authorization and auditable financial operations.

## Decision

- PostgreSQL (Supabase) is the source of truth for money and permissions.
- The browser **reads** through RLS (and Realtime) but **never writes** to financial tables.
- All writes go: browser → `apps/api` (Hono + Zod: validation, rate limiting, idempotency) →
  PostgreSQL `api.*` functions executed in a single transaction.
- Authorization is enforced twice: in the API and inside the database functions/RLS.
- `apps/api` stays thin: no financial arithmetic or business rules live there.

## Consequences

- Rules are testable in one place (pgTAP) and cannot be bypassed by a modified client.
- Supabase gives Auth, Realtime and managed Postgres quickly.
  − Business logic in SQL requires discipline and good tests.
  − Vendor coupling is limited to Auth/Realtime; schema and functions are plain PostgreSQL.

* Open item: hosting region / PDPL data-residency must be confirmed before production.
