# Security

> Status: **Phase 0** — policies and guard-rails. Controls marked _(planned)_ land with their feature phase.

## Principles

- The browser is **untrusted**. It never writes financial data and never holds secrets.
- **Defence in depth**: API validation + authorization, then database RLS and function-level checks.
- **Least privilege**: roles/permissions in the database; service-role credentials only in `apps/api` and `apps/worker`.
- **Auditability**: financial history is append-only; sensitive actions go to `audit_logs` _(planned)_.

## Secrets

- Only `.env.example` is tracked; `.env*`, keys and certificates are git-ignored.
- `pnpm check:secrets` (CI) fails if an env/key file would be committed, or if server-only names
  (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, ...) appear in browser code, or a `VITE_*SECRET*` variable exists.
- `gitleaks` scans the full history in CI.
- Env validation rejects `.env.example` placeholders (`replace-with-...`) and never prints values.
- `VITE_*` variables are public by definition. The Supabase anon/publishable key is the only credential allowed there.
- Rotate any key that was ever committed or shared in a screenshot/chat. (The previous Lovable prototype contained keys in `.env.*`; do not reuse them.)

## API baseline (already in place)

- CORS allow-list (unknown origins receive no CORS headers); secure headers; 1 MiB body limit.
- Request id on every request/response (`X-Request-Id`), propagated into logs.
- Structured logs with redaction of tokens, cookies, OTPs, phone numbers and secrets.
- Errors never leak internals; unknown errors return a generic 500 and are logged server-side.

## Browser / PWA

- The service worker caches **only the static app shell**. No runtime caching: API responses
  (balances, invoices, ledger) are never stored by the service worker.
- No `localStorage`/`IndexedDB` for money, debts or balances. TanStack Query cache is in-memory only.
  Zustand (cashier cart/UI state) is in-memory only.

## Financial integrity _(Phases 1–5)_

- No INSERT/UPDATE/DELETE grants for `anon`/`authenticated` on financial tables.
- Writes only via `api.*` SECURITY DEFINER functions with `app.require_permission(...)`.
- Idempotency keys on all financial operations; row locks for credit-limit checks.
- Money in integer halalas; prices, VAT and totals computed by the database.
- Ledger/audit append-only (triggers + privileges); reversals instead of deletes.

## Authentication & OTP _(Phase 2)_

- Phone (E.164) + OTP: 6 digits, 5 min expiry, max 5 attempts, resend cool-down, per-phone/IP/device limits.
- OTP stored hashed (HMAC with server secret), never logged. Test numbers only in non-production.
- Phone number is the identity; changing it requires OTP on the new number.

## QR _(Phase 5)_

- 256-bit random token, only SHA-256 stored; revocable and rotatable.
- Resolution requires an active store member with `customers.scan_qr`; minimal data returned; rate limited and audited.

## Webhooks _(Phase 9)_

- Verify provider signature, store `webhook_events` with unique `(provider, event_id)`, process idempotently,
  and confirm payment status with the provider before recording anything.

## Reporting a vulnerability

Open a private security advisory on the repository (do not file a public issue).
