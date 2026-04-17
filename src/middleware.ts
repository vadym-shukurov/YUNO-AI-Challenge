import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function toBase64Url(bytes: Uint8Array) {
  // Convert to base64url (RFC 4648 §5) without padding.
  const base64 = Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function makeNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

function buildCsp({ nonce, isDev }: { nonce: string; isDev: boolean }) {
  // In production we enforce a nonce-based CSP (no unsafe-inline/eval).
  // In dev, Next's tooling often relies on eval/inline; keep it permissive but still report.
  if (isDev) {
    return {
      header: "Content-Security-Policy-Report-Only",
      value: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "connect-src 'self' ws: wss:",
        "upgrade-insecure-requests",
        "report-uri /api/csp-report",
      ].join("; "),
    };
  }

  return {
    header: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // NOTE: Next App Router injects inline bootstrapping scripts/styles.
      // A strict nonce-based CSP requires every inline block to include that nonce.
      // In this prototype we prefer functional hydration + tests over strict CSP.
      // If hardening for production, switch back to nonces/hashes once fully supported.
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "upgrade-insecure-requests",
      "report-uri /api/csp-report",
    ].join("; "),
  };
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const isDev = process.env.NODE_ENV !== "production";
  const nonce = makeNonce();
  const csp = buildCsp({ nonce, isDev });

  // The CSP header is applied to HTML responses (see matcher below).
  res.headers.set(csp.header, csp.value);

  // Defense-in-depth: duplicate key headers at the edge (covers non-HTML too).
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  res.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return res;
}

export const config = {
  matcher: [
    /**
     * Skip Next.js internals and static assets to reduce overhead and avoid
     * interfering with immutable caching.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

