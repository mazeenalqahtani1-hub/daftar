import { describe, expect, it } from "vitest";
import { EnvValidationError } from "@daftar/shared";
import { loadApiEnv } from "./env";

const valid = {
  NODE_ENV: "test",
  API_ALLOWED_ORIGINS: "http://localhost:5173, https://app.example.test",
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
};

describe("loadApiEnv", () => {
  it("accepts a valid environment and applies defaults", () => {
    const env = loadApiEnv(valid);
    expect(env.API_PORT).toBe(8787);
    expect(env.API_LOG_LEVEL).toBe("info");
    expect(env.API_ALLOWED_ORIGINS).toHaveLength(2);
  });

  it("fails when the service-role key is missing", () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _omit, ...rest } = valid;
    expect(() => loadApiEnv(rest)).toThrow(EnvValidationError);
  });

  it("fails on placeholder secrets", () => {
    expect(() =>
      loadApiEnv({ ...valid, SUPABASE_ANON_KEY: "replace-with-local-anon-key" }),
    ).toThrow(EnvValidationError);
  });
});
