import { describe, expect, it } from "vitest";
import { z } from "zod";
import { EnvValidationError, commaListSchema, parseEnv, portSchema, secretSchema } from "./env";

const schema = z.object({
  PORT: portSchema,
  ORIGINS: commaListSchema,
  SECRET: secretSchema,
});

describe("parseEnv", () => {
  it("parses and coerces valid values", () => {
    const env = parseEnv(
      schema,
      { PORT: "8787", ORIGINS: "http://a.test, http://b.test ,", SECRET: "s3cr3t" },
      "test",
    );
    expect(env.PORT).toBe(8787);
    expect(env.ORIGINS).toEqual(["http://a.test", "http://b.test"]);
  });

  it("reports every invalid key by name", () => {
    expect.assertions(3);
    try {
      parseEnv(schema, { PORT: "0", ORIGINS: "x" }, "test");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const keys = (error as EnvValidationError).issues.map((i) => i.key).sort();
      expect(keys).toEqual(["PORT", "SECRET"]);
      expect((error as EnvValidationError).scope).toBe("test");
    }
  });

  it("never leaks secret values in the error message", () => {
    const leaky = "super-secret-value-123";
    expect.assertions(1);
    try {
      parseEnv(
        z.object({ PORT: portSchema, SECRET: secretSchema }),
        { PORT: leaky, SECRET: "replace-with-x" },
        "test",
      );
    } catch (error) {
      expect((error as Error).message).not.toContain(leaky);
    }
  });

  it("rejects .env.example placeholders as secrets", () => {
    expect(secretSchema.safeParse("replace-with-local-key").success).toBe(false);
  });
});
