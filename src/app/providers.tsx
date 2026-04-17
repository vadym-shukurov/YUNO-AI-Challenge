"use client";

import * as React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </React.Suspense>
  );
}
