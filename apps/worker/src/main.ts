import { createLogger } from "@daftar/shared/logger";
import { loadWorkerEnv } from "./env";
import { createRunner, type Task } from "./runner";

const env = loadWorkerEnv();
const logger = createLogger(env.WORKER_LOG_LEVEL, "worker");

// Phase 0: no jobs yet. Later phases register tasks here
// (notification outbox, invoice-request expiry, ledger reconciliation).
const tasks: readonly Task[] = [];

const runner = createRunner({ intervalMs: env.WORKER_POLL_INTERVAL_MS, logger, tasks });
runner.start();

async function shutdown(signal: string) {
  logger.info({ signal }, "shutting down");
  await runner.stop();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
