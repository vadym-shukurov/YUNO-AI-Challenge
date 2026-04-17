import { spawn } from "node:child_process";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const PORT = Number(new URL(BASE_URL).port || 3000);
const HOST = new URL(BASE_URL).hostname || "127.0.0.1";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHealthy(timeoutMs = 60_000) {
  const start = Date.now();
  // Prefer health endpoint (fast + deterministic).
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`, {
        headers: { "User-Agent": "with-server" },
      });
      if (res.ok) return;
    } catch {
      // ignore
    }
    await sleep(500);
  }
  throw new Error(`Server did not become healthy within ${timeoutMs}ms`);
}

function parseCommand(argv) {
  const sep = argv.indexOf("--");
  if (sep === -1 || sep === argv.length - 1) {
    throw new Error(
      "Usage: node scripts/with-server.mjs -- <command> [args...]",
    );
  }
  return argv.slice(sep + 1);
}

async function main() {
  const cmd = parseCommand(process.argv);

  // Build once per invocation to keep results reproducible and match production output.
  const build = spawn("npm", ["run", "build"], { stdio: "inherit" });
  const buildCode = await new Promise((resolve) =>
    build.on("exit", (code) => resolve(code ?? 1)),
  );
  if (buildCode !== 0) process.exit(buildCode);

  // Start production server.
  const server = spawn(
    "npx",
    ["next", "start", "-p", String(PORT), "-H", HOST],
    { stdio: "inherit" },
  );

  const shutdown = () => {
    if (!server.killed) server.kill("SIGTERM");
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await waitForHealthy();
    const child = spawn(cmd[0], cmd.slice(1), {
      stdio: "inherit",
      env: { ...process.env, TEST_BASE_URL: BASE_URL, SECURITY_BASE_URL: BASE_URL },
    });
    const code = await new Promise((resolve) =>
      child.on("exit", (c) => resolve(c ?? 1)),
    );
    process.exitCode = code;
  } finally {
    shutdown();
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

