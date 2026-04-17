"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { ALERT_WINDOW_HOURS } from "@/lib/hooks/use-processed-data";
import type { ProcessorAlert, ProcessorApprovalRow } from "@/lib/hooks/use-processed-data";

export function ApprovalComparisonChart({
  data,
  alerts,
}: {
  data: ProcessorApprovalRow[];
  alerts: ProcessorAlert[];
}) {
  const flagged = new Set(alerts.map((a) => a.processor));
  const chartData = data.map((row) => ({
    processor: row.processor,
    shortLabel: row.processor.replace("Processor ", "P-"),
    Baseline: Number((row.baseline * 100).toFixed(1)),
    // Match Smart Alerts semantics: “current” is the trailing window, not the full range.
    Current: Number((row.recentCurrent * 100).toFixed(1)),
    WholeRange: Number((row.current * 100).toFixed(1)),
    anomaly: flagged.has(row.processor),
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Approval Rate vs Baseline</CardTitle>
        <CardDescription>
          “Current” uses the last {ALERT_WINDOW_HOURS}h of your selected range (same window as Smart
          Alerts). Muted bars show the whole-range approval rate in the tooltip for context.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 16, bottom: 0, left: -16 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="processor"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  typeof value === "string"
                    ? value.replace("Processor ", "P-")
                    : String(value)
                }
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  fontSize: 12,
                }}
                formatter={(v: number, name, item) => {
                  const payload = item?.payload as (typeof chartData)[number] | undefined;
                  if (name === "Current" && payload) {
                    return [
                      `${v.toFixed(1)}% (whole range ${payload.WholeRange.toFixed(1)}%)`,
                      name,
                    ];
                  }
                  return [`${v.toFixed(1)}%`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar
                dataKey="Baseline"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.35}
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="Current" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.shortLabel}
                    fill={
                      entry.anomaly
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--primary))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
