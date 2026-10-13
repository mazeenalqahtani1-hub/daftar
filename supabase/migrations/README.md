# Migrations

Empty in Phase 0 by design. Final schema migrations start in **Phase 1**, only after the
schema design has been reviewed and approved.

Conventions (from Phase 1):

- Numbered, descriptive files: `0001_identity.sql`, `0002_tenancy.sql`, ...
- Forward-only. Never edit a migration that has been applied outside your machine.
- Financial tables: `REVOKE INSERT, UPDATE, DELETE` from `anon`/`authenticated`;
  writes happen only through `api.*` SECURITY DEFINER functions.
- Every table with `store_id` or `customer_id` gets RLS enabled in the same migration that creates it.
