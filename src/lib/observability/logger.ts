/**
 * Minimal structured logging for the browser and server runtimes. Events are JSON lines
 * with stable `message` prefixes (`app.*`, `api.*`, …) so production pipelines can route
 * or alert without parsing ad-hoc strings.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEvent {
  level: LogLevel;
  message: string;
  ts: string;
  context?: Record<string, unknown>;
}

function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  // In production, keep client logs low-noise; forward errors to monitoring instead.
  return level === "error" || level === "warn";
}

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (!shouldLog(level)) return;
  const event: LogEvent = { level, message, ts: new Date().toISOString(), context };

  // Structured logs (JSON) are easy to ingest in common platforms.
  // Use event-style "message" keys (`domain.action`) so log routing/alerts can be
  // configured by prefix (e.g. `app.*`, `api.*`, `recovery.*`).
  // Keep the console call simple: browser + Node runtimes both support it.
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](JSON.stringify(event));
}

