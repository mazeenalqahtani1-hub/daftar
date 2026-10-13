import { describe, expect, it, vi } from "vitest";
import { createLogger } from "@daftar/shared/logger";
import { createRunner, type Task } from "./runner";

const logger = createLogger("silent", "worker-test");

describe("runner", () => {
  it("runs every task on tick, in order", async () => {
    const order: string[] = [];
    const tasks: Task[] = [
      { name: "a", run: () => Promise.resolve(void order.push("a")) },
      { name: "b", run: () => Promise.resolve(void order.push("b")) },
    ];
    await createRunner({ intervalMs: 1000, logger, tasks }).tick();
    expect(order).toEqual(["a", "b"]);
  });

  it("isolates a failing task from the others", async () => {
    const second = vi.fn(() => Promise.resolve());
    const tasks: Task[] = [
      { name: "boom", run: () => Promise.reject(new Error("x")) },
      { name: "ok", run: second },
    ];
    await expect(createRunner({ intervalMs: 1000, logger, tasks }).tick()).resolves.toBeUndefined();
    expect(second).toHaveBeenCalledOnce();
  });

  it("start schedules ticks and stop waits for the loop to end", async () => {
    vi.useFakeTimers();
    const run = vi.fn(() => Promise.resolve());
    const runner = createRunner({ intervalMs: 1000, logger, tasks: [{ name: "t", run }] });
    runner.start();
    await vi.advanceTimersByTimeAsync(1000);
    expect(run).toHaveBeenCalledTimes(1);
    await runner.stop();
    await vi.advanceTimersByTimeAsync(5000);
    expect(run).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
