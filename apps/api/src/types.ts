import type { Logger } from "@daftar/shared/logger";

/** Hono environment: typed per-request variables. */
export type AppEnv = {
  Variables: {
    requestId: string;
    logger: Logger;
  };
};
