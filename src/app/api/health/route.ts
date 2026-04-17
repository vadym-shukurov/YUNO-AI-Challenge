import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Lightweight health endpoint suitable for uptime checks and basic SLO monitoring.
  // Keep response stable and fast (no upstream dependencies in this prototype).
  return NextResponse.json(
    {
      status: "ok",
      service: "yuno-dashboard",
      ts: new Date().toISOString(),
    },
    { status: 200 },
  );
}

