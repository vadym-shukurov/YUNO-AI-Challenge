"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import { PROCESSOR_COLORS } from "@/lib/constants/processor-colors";
import type { ProcessorVolumeSlice } from "@/lib/hooks/use-processed-data";

export function ProcessorDistributionChart({
  data,
}: {
  data: ProcessorVolumeSlice[];
}) {
  const nonZero = data.filter((d) => d.count > 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Processor Mix</CardTitle>
        <CardDescription>
          Share of transactions by processor for your current filters (payment method, date range,
          and header refinements all apply).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nonZero}
                dataKey="count"
                nameKey="processor"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {nonZero.map((entry) => (
                  <Cell
                    key={entry.processor}
                    fill={PROCESSOR_COLORS[entry.processor]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  fontSize: 12,
                }}
                formatter={(value: number, _name, item) => {
                  const share = (item?.payload as ProcessorVolumeSlice)?.share ?? 0;
                  return [
                    `${formatNumber(value)} (${formatPercent(share)})`,
                    item?.payload?.processor,
                  ];
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
