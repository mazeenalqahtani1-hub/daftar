# 0002 — Append-only ledger and integer halalas

**Status:** Accepted

## Decision

- A customer's balance is **derived** from ledger entries (sum of signed amounts); it is never set by hand.
- `ledger_entries` (and `audit_logs`) are append-only: updates/deletes are blocked by triggers and privileges.
- Cancellations and returns are **reversal entries** that reference the original entry.
- Money is `bigint` **halalas** (1 SAR = 100). No floating point anywhere in money paths.
- Writes use idempotency keys (unique per store) so retries never duplicate a financial operation.
- Credit-limit checks happen inside the same transaction, under a row lock on the customer account.

## Consequences

- Complete, auditable history; trivial reconciliation (`SUM(entries) == balance projection`).
  − Corrections need explicit reversal/adjustment entries (by design).
