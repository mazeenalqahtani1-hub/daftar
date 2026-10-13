import { describe, expect, it } from "vitest";
import { EnvValidationError } from "@daftar/shared";
import { loadWorkerEnv } from "./env";

const valid = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
};

describe("loadWorkerEnv", () => {
  it("applies defaults", () => {
    expect(loadWorkerEnv(valid).WORKER_POLL_INTERVAL_MS).toBe(5000);
  });
  it("rejects a too-small poll interval", () => {
    expect(() => loadWorkerEnv({ ...valid, WORKER_POLL_INTERVAL_MS: "10" })).toThrow(
      EnvValidationError,
    );
  });
});
