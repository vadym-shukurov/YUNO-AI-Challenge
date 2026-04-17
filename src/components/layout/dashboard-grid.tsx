import * as React from "react";

import { cn } from "@/lib/utils";

export function DashboardGrid({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GridItem({
  span = 1,
  className,
  children,
}: {
  span?: 1 | 2 | 3 | 4;
  className?: string;
  children: React.ReactNode;
}) {
  const spanClass = {
    1: "xl:col-span-1",
    2: "sm:col-span-2 xl:col-span-2",
    3: "sm:col-span-2 xl:col-span-3",
    4: "sm:col-span-2 xl:col-span-4",
  }[span];

  return <div className={cn(spanClass, className)}>{children}</div>;
}
