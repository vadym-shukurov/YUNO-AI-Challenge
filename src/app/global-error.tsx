"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { log } from "@/lib/observability/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log("error", "app.global_error_boundary", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 p-6">
        <h2 className="text-lg font-semibold">Application error</h2>
        <p className="text-sm text-muted-foreground">
          The app failed to render. Try again, or refresh to recover.
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </body>
    </html>
  );
}

