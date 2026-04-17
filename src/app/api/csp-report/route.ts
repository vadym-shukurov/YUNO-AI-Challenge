import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Intentionally minimal: accept reports without logging sensitive payloads.
  // If you later want observability, forward sanitized summaries to your monitoring.
  try {
    // Consume body to avoid keeping connections open; ignore content.
    // Bound the work we do per-request: don't allow arbitrarily large payloads.
    const body = await req.text();
    if (body.length > 64_000) {
      return new NextResponse(null, { status: 413 });
    }
  } catch {
    // Ignore body parse errors.
  }

  return new NextResponse(null, { status: 204 });
}

