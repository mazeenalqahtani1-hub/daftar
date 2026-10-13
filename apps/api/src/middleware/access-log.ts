import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";

/** One structured line per request. Path only: query strings can carry tokens. */
export const accessLog = createMiddleware<AppEnv>(async (c, next) => {
  const started = performance.now();
  await next();
  c.get("logger").info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - started),
    },
    "request",
  );
});
