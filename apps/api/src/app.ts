import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { createMiddleware } from "hono/factory";
import type { ApiEnv } from "./infra/env";
import type { Logger } from "@daftar/shared/logger";
import { accessLog } from "./middleware/access-log";
import { notFound, onError } from "./middleware/errors";
import { requestId } from "./middleware/request-id";
import type { AppEnv } from "./types";

const MAX_BODY_BYTES = 1024 * 1024; // 1 MiB

export type AppDeps = {
  readonly env: Pick<ApiEnv, "API_ALLOWED_ORIGINS">;
  readonly logger: Logger;
};

/**
 * Builds the Hono application. Pure factory (no I/O) so it is trivially testable.
 * Feature modules (auth, invoices, ...) are mounted here from Phase 2 onward.
 */
export function createApp({ env, logger }: AppDeps): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use(requestId);
  app.use(
    createMiddleware<AppEnv>(async (c, next) => {
      c.set("logger", logger.child({ requestId: c.get("requestId") }));
      await next();
    }),
  );
  app.use(accessLog);
  app.use(secureHeaders());
  app.use(
    cors({
      // Unknown origins get no CORS headers at all.
      origin: (origin) => (env.API_ALLOWED_ORIGINS.includes(origin) ? origin : null),
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Authorization", "Content-Type", "Idempotency-Key", "X-Request-Id"],
      exposeHeaders: ["X-Request-Id"],
      maxAge: 600,
    }),
  );
  app.use(
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) =>
        // bodyLimit's callback context is untyped in Hono: narrow the id explicitly.
        c.json(
          {
            error: {
              code: "payload_too_large",
              message: "Request body too large",
              requestId: String(c.get("requestId")),
            },
          },
          413,
        ),
    }),
  );

  // Liveness only: no dependency checks, no data. Readiness arrives with the DB layer (Phase 1).
  app.get("/health", (c) => c.json({ status: "ok" as const }));

  app.notFound(notFound);
  app.onError(onError);
  return app;
}
