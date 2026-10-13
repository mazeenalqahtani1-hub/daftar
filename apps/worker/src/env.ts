import { z } from "zod";
import { logLevelSchema, nodeEnvSchema, parseEnv, secretSchema } from "@daftar/shared";

/** Environment contract of apps/worker (server only). */
export const workerEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  WORKER_LOG_LEVEL: logLevelSchema,
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().min(500).max(300_000).default(5000),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: secretSchema,
  DATABASE_URL: z.url(),
});

export type WorkerEnv = z.output<typeof workerEnvSchema>;

export function loadWorkerEnv(source: Readonly<Record<string, unknown>> = process.env): WorkerEnv {
  return parseEnv(workerEnvSchema, source, "apps/worker");
}
