export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio?: number;
  shouldRetry?: (error: unknown) => boolean;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const shouldRetry = options.shouldRetry ?? (() => true);
  const jitterRatio = options.jitterRatio ?? 0.2;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const canRetry = attempt <= options.retries && shouldRetry(err);
      if (!canRetry) throw err;

      // Exponential backoff with jitter: reduces thundering herds on recovery.
      const exp = options.baseDelayMs * 2 ** (attempt - 1);
      const capped = Math.min(options.maxDelayMs, exp);
      const jitter = capped * jitterRatio * (Math.random() - 0.5) * 2;
      await sleep(Math.max(0, capped + jitter));
    }
  }
}

