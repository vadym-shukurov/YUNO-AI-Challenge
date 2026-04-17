"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn, formatPercent } from "@/lib/utils";
import {
  ALERT_WINDOW_HOURS,
  MIN_ALERT_VOLUME,
  type ProcessorAlert,
} from "@/lib/hooks/use-processed-data";

export function SmartAlerts({ alerts }: { alerts: ProcessorAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-success" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              All processors operating within baseline
            </span>
            <span className="text-xs text-muted-foreground">
              No statistically meaningful approval-rate drops detected in the last{" "}
              {ALERT_WINDOW_HOURS}h (requires at least {MIN_ALERT_VOLUME} transactions per
              processor in that window).
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.processor} alert={alert} />
      ))}
    </div>
  );
}

function AlertCard({ alert }: { alert: ProcessorAlert }) {
  const critical = alert.severity === "critical";
  return (
    <Card
      className={cn(
        "border-l-4",
        critical
          ? "border-l-destructive bg-destructive/5"
          : "border-l-warning bg-warning/5",
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            critical ? "text-destructive" : "text-warning",
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                critical
                  ? "bg-destructive/15 text-destructive"
                  : "bg-warning/15 text-warning",
              )}
            >
              {critical ? "Critical" : "Warning"}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {alert.processor}
            </span>
          </div>
          <p className="text-sm text-foreground">
            Approval rate dropped to{" "}
            <span className="font-semibold">
              {formatPercent(alert.current)}
            </span>{" "}
            (baseline {formatPercent(alert.baseline)}) —{" "}
            <span className="font-semibold text-destructive">
              −{formatPercent(alert.drop)}
            </span>{" "}
            over {alert.volume} txns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
