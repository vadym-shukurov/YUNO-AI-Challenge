"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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
import type { ApprovalTrendPoint } from "@/lib/hooks/use-processed-data";

export function ApprovalTrendChart({
  data,
  granularity,
}: {
  data: ApprovalTrendPoint[];
  granularity: "hour" | "day";
}) {
  const chartData = data.map((p) => ({
    ...p,
    approvalPct: Number((p.approvalRate * 100).toFixed(1)),
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Approval Rate Over Time</CardTitle>
        <CardDescription>
          Bucketed by {granularity === "hour" ? "hour" : "day"} — dashed line is
          the 82% overall target.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 16, bottom: 0, left: -16 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
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
                formatter={(v: number) => [`${v.toFixed(1)}%`, "Approval rate"]}
              />
              <ReferenceLine
                y={82}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                label={{
                  value: "Target 82%",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="approvalPct"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
