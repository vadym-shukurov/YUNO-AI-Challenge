import * as React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
        {icon ? (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md",
              tone === "positive" && "bg-success/10 text-success",
              tone === "negative" && "bg-destructive/10 text-destructive",
              tone === "warning" && "bg-warning/10 text-warning",
              tone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
