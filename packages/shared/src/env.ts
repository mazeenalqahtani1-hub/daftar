import { z } from "zod";

export type EnvIssue = { readonly key: string; readonly message: string };

/**
 * Thrown when environment variables are missing or invalid.
 * IMPORTANT: it only ever reports variable NAMES and rule messages — never values —
 * so a misconfigured secret can never leak into logs or CI output.
 */
export class EnvValidationError extends Error {
  readonly scope: string;
  readonly issues: readonly EnvIssue[];

  constructor(scope: string, issues: readonly EnvIssue[]) {
    const lines = issues.map((i) => `  - ${i.key}: ${i.message}`).join("\n");
    super(`Invalid environment configuration (${scope}):\n${lines}`);
    this.name = "EnvValidationError";
    this.scope = scope;
    this.issues = issues;
  }
}

/**
 * Validates an environment source against a Zod schema.
 * Each app owns its own schema and validates ONLY the variables it needs.
 */
export function parseEnv<S extends z.ZodType>(
  schema: S,
  source: Readonly<Record<string, unknown>>,
  scope: string,
): z.output<S> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => ({
    key: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
  throw new EnvValidationError(scope, issues);
}

/* Reusable field schemas ------------------------------------------------- */

export const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

export const logLevelSchema = z
  .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
  .default("info");

export const portSchema = z.coerce.number().int().min(1).max(65535);

/** "a, b ,c" -> ["a","b","c"] (empty items removed) */
export const commaListSchema = z.string().transform((value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0),
);

/** A secret: must be non-empty and must not be a leftover placeholder. */
export const secretSchema = z
  .string()
  .min(1, "must not be empty")
  .refine((v) => !v.startsWith("replace-with"), "still contains the .env.example placeholder");
