"use client";

import {
  Activity,
  CheckCircle2,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  DashboardGrid,
  GridItem,
} from "@/components/layout/dashboard-grid";
import { describeActiveFilters } from "@/lib/filters/describe-active-filters";
import { useFilters } from "@/lib/filters/use-filters";
import { useProcessedData } from "@/lib/hooks/use-processed-data";
import { formatIDR, formatNumber, formatPercent } from "@/lib/utils";

import { ApprovalComparisonChart } from "./approval-comparison-chart";
import { ApprovalTrendChart } from "./approval-trend-chart";
import { KpiCard } from "./kpi-card";
import { ProcessorDistributionChart } from "./processor-distribution-chart";
import { SmartAlerts } from "./smart-alerts";

export function DashboardOverview() {
  const data = useProcessedData();
  const filters = useFilters();
  const filterCaption = describeActiveFilters({
    preset: filters.preset,
    dateRange: filters.dateRange,
    paymentMethod: filters.paymentMethod,
    processor: filters.processor,
    outcome: filters.outcome,
    amountMin: filters.amountMin,
    amountMax: filters.amountMax,
    query: filters.query,
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Smart Alerts
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {data.alerts.length} active
          </span>
        </div>
        <SmartAlerts alerts={data.alerts} />
      </section>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Current view:</span> {filterCaption}
      </p>

      <DashboardGrid>
        <GridItem>
          <KpiCard
            label="Total Volume"
            value={formatIDR(data.totalVolume)}
            hint={`${formatNumber(data.totalCount)} transactions`}
            icon={<Activity className="h-4 w-4" />}
          />
        </GridItem>
        <GridItem>
          <KpiCard
            label="Approval Rate"
            value={formatPercent(data.overallApprovalRate)}
            hint="Across all processors in window"
            tone="positive"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </GridItem>
        <GridItem>
          <KpiCard
            label="Decline Rate"
            value={formatPercent(data.overallDeclineRate)}
            hint="Issuer + risk declines"
            tone="warning"
            icon={<TriangleAlert className="h-4 w-4" />}
          />
        </GridItem>
        <GridItem>
          <KpiCard
            label="Failure Rate"
            value={formatPercent(data.overallFailureRate)}
            hint="Technical failures"
            tone="negative"
            icon={<XCircle className="h-4 w-4" />}
          />
        </GridItem>

        <GridItem span={4}>
          <ApprovalTrendChart
            data={data.approvalTrend}
            granularity={data.granularity}
          />
        </GridItem>

        <GridItem span={2}>
          <ApprovalComparisonChart data={data.processorApproval} alerts={data.alerts} />
        </GridItem>
        <GridItem span={2}>
          <ProcessorDistributionChart data={data.processorVolume} />
        </GridItem>
      </DashboardGrid>
    </div>
  );
}
