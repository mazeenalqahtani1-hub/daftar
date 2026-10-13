import { z } from "zod";
import { parseEnv } from "@daftar/shared";

/**
 * Environment contract of apps/web.
 * Everything here is PUBLIC (bundled into the browser): never put secrets in VITE_* variables.
 * The Supabase anon/publishable key is safe because all access is protected by RLS.
 */
export const webEnvSchema = z.object({
  VITE_APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  VITE_API_URL: z.url(),
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "must not be empty")
    .refine((v) => !v.startsWith("replace-with"), "still contains the .env.example placeholder"),
});

export type WebEnv = z.output<typeof webEnvSchema>;

export function loadWebEnv(source: Readonly<Record<string, unknown>>): WebEnv {
  return parseEnv(webEnvSchema, source, "apps/web");
}
