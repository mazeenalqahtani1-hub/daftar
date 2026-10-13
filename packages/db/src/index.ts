/**
 * @daftar/db — Phase 0 placeholder.
 *
 * Phase 1 will add: generated database types, and a typed client for the
 * `api.*` PostgreSQL functions (the ONLY write path for financial data).
 * No tables, queries or business logic live here yet.
 */

/** PostgreSQL schemas used by the project (see docs/architecture.md). */
export const DB_SCHEMAS = {
  /** Tables, read-only for end users (RLS). No client writes to financial tables. */
  public: "public",
  /** Write API: SECURITY DEFINER functions, callable by the API server only. */
  api: "api",
  /** Internal helpers (permission checks...). Not exposed. */
  app: "app",
} as const;

export type DbSchemaName = (typeof DB_SCHEMAS)[keyof typeof DB_SCHEMAS];
