import { describe, expect, it, vi } from "vitest";

import { retry } from "@/lib/recovery/retry";

describe("retry", () => {
  it("retries a failing async operation until it succeeds", async () => {
    vi.useFakeTimers();

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce("ok");

    const p = retry(fn, { retries: 3, baseDelayMs: 10, maxDelayMs: 50, jitterRatio: 0 });
    await vi.runAllTimersAsync();

    await expect(p).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });
});

