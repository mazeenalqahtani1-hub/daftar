import type { Logger } from "@daftar/shared/logger";

/** A unit of background work. Registered in later phases (outbox, expiry, reconciliation...). */
export type Task = {
  readonly name: string;
  run(): Promise<void>;
};

export type Runner = {
  start(): void;
  /** Resolves once the in-flight tick (if any) has finished. */
  stop(): Promise<void>;
  /** Runs every task once, sequentially. Exposed for tests and manual triggers. */
  tick(): Promise<void>;
};

export type RunnerOptions = {
  readonly intervalMs: number;
  readonly logger: Logger;
  readonly tasks: readonly Task[];
};

/**
 * Sequential polling loop:
 *  - ticks never overlap (next tick is scheduled after the previous one finishes);
 *  - a failing task is logged and isolated: it never stops the loop or other tasks.
 */
export function createRunner({ intervalMs, logger, tasks }: RunnerOptions): Runner {
  let timer: NodeJS.Timeout | undefined;
  let running = false;
  let inFlight: Promise<void> = Promise.resolve();

  async function tick(): Promise<void> {
    for (const task of tasks) {
      try {
        await task.run();
      } catch (error) {
        logger.error({ err: error, task: task.name }, "task failed");
      }
    }
  }

  function schedule(): void {
    if (!running) return;
    timer = setTimeout(() => {
      inFlight = tick().finally(schedule);
    }, intervalMs);
  }

  return {
    tick,
    start() {
      if (running) return;
      running = true;
      logger.info({ tasks: tasks.map((t) => t.name), intervalMs }, "worker started");
      schedule();
    },
    async stop() {
      running = false;
      if (timer) clearTimeout(timer);
      await inFlight;
      logger.info("worker stopped");
    },
  };
}
