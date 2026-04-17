const baseUrl = process.env.SECURITY_BASE_URL ?? "http://127.0.0.1:3000";

async function must(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function get(path) {
  const res = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    headers: { "User-Agent": "security-checks" },
  });
  return res;
}

async function main() {
  // Basic availability checks
  const home = await get("/");
  await must(home.status === 200, `GET / expected 200, got ${home.status}`);

  const health = await get("/api/health");
  await must(
    health.status === 200,
    `GET /api/health expected 200, got ${health.status}`,
  );

  // Param-fuzz: ensure we don't reflect raw query into HTML response.
  // (This app doesn't render query directly, but we keep a guard anyway.)
  const payload = encodeURIComponent(`<script>alert(1)</script>`);
  const fuzz = await get(`/?q=${payload}&method=${payload}&range=${payload}`);
  await must(fuzz.status === 200, `GET fuzz expected 200, got ${fuzz.status}`);
  const text = await fuzz.text();
  await must(
    !text.includes("<script>alert(1)</script>"),
    "Reflected XSS payload detected in HTML response",
  );

  // CSP report endpoint should bound payload sizes
  const big = "x".repeat(70_000);
  const csp = await fetch(`${baseUrl}/api/csp-report`, {
    method: "POST",
    headers: { "Content-Type": "application/csp-report" },
    body: big,
  });
  await must(
    [204, 413].includes(csp.status),
    `POST /api/csp-report expected 204/413, got ${csp.status}`,
  );
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

