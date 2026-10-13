import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createLogger } from "@daftar/shared/logger";

const app = createApp({
  env: { API_ALLOWED_ORIGINS: ["http://localhost:5173"] },
  logger: createLogger("silent", "api-test"),
});

describe("api shell", () => {
  it("GET /health returns ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("adds a request id and security headers", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("x-request-id")).toBeTruthy();
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("echoes a well-formed incoming request id, replaces a malformed one", async () => {
    const good = await app.request("/health", { headers: { "x-request-id": "abc12345-req" } });
    expect(good.headers.get("x-request-id")).toBe("abc12345-req");
    const bad = await app.request("/health", { headers: { "x-request-id": "bad id!!" } });
    expect(bad.headers.get("x-request-id")).not.toBe("bad id!!");
  });

  it("returns a structured 404", async () => {
    const res = await app.request("/nope");
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error: { code: string; requestId: string } };
    expect(json.error.code).toBe("not_found");
    expect(json.error.requestId).toBeTruthy();
  });

  it("allows only configured CORS origins", async () => {
    const ok = await app.request("/health", { headers: { Origin: "http://localhost:5173" } });
    expect(ok.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    const evil = await app.request("/health", { headers: { Origin: "https://evil.example" } });
    expect(evil.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("rejects oversized bodies", async () => {
    const big = "x".repeat(1024 * 1024 + 1);
    const res = await app.request("/health", {
      method: "POST",
      body: big,
      headers: { "content-length": String(big.length) },
    });
    expect(res.status).toBe(413);
  });
});
