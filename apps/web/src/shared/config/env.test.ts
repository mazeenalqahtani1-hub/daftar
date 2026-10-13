import { describe, expect, it } from "vitest";
import { EnvValidationError } from "@daftar/shared";
import { loadWebEnv } from "./env";

const valid = {
  VITE_API_URL: "http://localhost:8787",
  VITE_SUPABASE_URL: "http://127.0.0.1:54321",
  VITE_SUPABASE_ANON_KEY: "anon",
};

describe("loadWebEnv", () => {
  it("accepts a valid public configuration", () => {
    expect(loadWebEnv(valid).VITE_APP_ENV).toBe("development");
  });
  it("rejects a missing API url", () => {
    const { VITE_API_URL: _omit, ...rest } = valid;
    expect(() => loadWebEnv(rest)).toThrow(EnvValidationError);
  });
  it("rejects the .env.example placeholder key", () => {
    expect(() =>
      loadWebEnv({ ...valid, VITE_SUPABASE_ANON_KEY: "replace-with-local-anon-key" }),
    ).toThrow(EnvValidationError);
  });
});
