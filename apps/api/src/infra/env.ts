import { z } from "zod";
import {
  commaListSchema,
  logLevelSchema,
  nodeEnvSchema,
  parseEnv,
  portSchema,
  secretSchema,
} from "@daftar/shared";

/**
 * Environment contract of apps/api (server only).
 * The service-role key and database URL may exist ONLY in server processes.
 */
export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  API_PORT: portSchema.default(8787),
  API_LOG_LEVEL: logLevelSchema,
  API_ALLOWED_ORIGINS: commaListSchema.pipe(
    z.array(z.url()).min(1, "at least one origin is required"),
  ),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: secretSchema,
  SUPABASE_SERVICE_ROLE_KEY: secretSchema,
  DATABASE_URL: z.url(),
});

export type ApiEnv = z.output<typeof apiEnvSchema>;

export function loadApiEnv(source: Readonly<Record<string, unknown>> = process.env): ApiEnv {
  return parseEnv(apiEnvSchema, source, "apps/api");
}
