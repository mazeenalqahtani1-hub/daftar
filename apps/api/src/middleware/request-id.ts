import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";

const SAFE_ID = /^[A-Za-z0-9._-]{8,64}$/;

/** Correlates a request across API, database audit logs and Sentry. */
export const requestId = createMiddleware<AppEnv>(async (c, next) => {
  const incoming = c.req.header("x-request-id");
  const id = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
  c.set("requestId", id);
  c.header("X-Request-Id", id);
  await next();
});
