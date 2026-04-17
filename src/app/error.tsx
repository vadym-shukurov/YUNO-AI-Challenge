"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { log } from "@/lib/observability/logger";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log("error", "app.error_boundary", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        The dashboard hit an unexpected error. Try again; if it keeps happening, refresh the
        page.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    </div>
  );
}

