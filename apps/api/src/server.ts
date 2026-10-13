import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadApiEnv } from "./infra/env";
import { createLogger } from "@daftar/shared/logger";

const env = loadApiEnv();
const logger = createLogger(env.API_LOG_LEVEL, "api");
const app = createApp({ env, logger });

const server = serve({ fetch: app.fetch, port: env.API_PORT }, (info) => {
  logger.info({ port: info.port, nodeEnv: env.NODE_ENV }, "api listening");
});

function shutdown(signal: string) {
  logger.info({ signal }, "shutting down");
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "error during shutdown");
      process.exit(1);
    }
    process.exit(0);
  });
  // Hard stop if connections refuse to drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
