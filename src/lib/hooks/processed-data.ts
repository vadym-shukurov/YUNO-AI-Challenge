/**
 * Pure functions that turn a transaction list + filter snapshot into dashboard-ready
 * aggregates (approval trends, processor mix, Smart Alert inputs, search-backed subsets).
 */
import { differenceInDays, format, startOfDay, startOfHour } from "date-fns";

import {
  PROCESSOR_METRICS,
  type Processor,
  type Transaction,
} from "@/lib/generateMockData";
import { transactionMatchesQuery } from "@/lib/transactions/search";

export const ANOMALY_DROP_THRESHOLD = 0.1;
export const MIN_ALERT_VOLUME = 15;
export const ALERT_WINDOW_HOURS = 48;
const MS_PER_HOUR = 60 * 60 * 1000;

export interface ProcessorVolumeSlice {
  processor: Processor;
  count: number;
  share: number;
}

export interface ProcessorApprovalRow {
  processor: Processor;
  baseline: number;
  /** Approval rate across the entire selected date range. */
  current: number;
  /** Approval rate over the trailing alert window (see `ALERT_WINDOW_HOURS`), aligned with Smart Alerts. */
  recentCurrent: number;
  delta: number;
  /** Volume (txn count) across the entire selected date range. */
  volume: number;
  /** Volume (txn count) inside the trailing alert window, aligned with Smart Alerts. */
  recentVolume: number;
}

export interface ApprovalTrendPoint {
  bucket: string;
  label: string;
  approvalRate: number;
  volume: number;
}

export interface ProcessorAlert {
  processor: Processor;
  severity: "critical" | "warning";
  baseline: number;
  current: number;
  drop: number;
  volume: number;
}

export interface ProcessedData {
  transactions: Transaction[];
  totalCount: number;
  totalVolume: number;
  overallApprovalRate: number;
  overallDeclineRate: number;
  overallFailureRate: number;
  processorVolume: ProcessorVolumeSlice[];
  processorApproval: ProcessorApprovalRow[];
  approvalTrend: ApprovalTrendPoint[];
  alerts: ProcessorAlert[];
  granularity: "hour" | "day";
}

export interface ProcessFilters {
  fromMs: number;
  toMs: number;
  paymentMethod: Transaction["paymentMethod"] | "all";
  processor: Processor | "all";
  outcome: Transaction["status"] | "all";
  amountMin: number | null;
  amountMax: number | null;
  query: string;
}

function bucketKey(date: Date, granularity: "hour" | "day") {
  const anchor = granularity === "hour" ? startOfHour(date) : startOfDay(date);
  return anchor.toISOString();
}

function bucketLabel(iso: string, granularity: "hour" | "day") {
  const d = new Date(iso);
  return granularity === "hour" ? format(d, "MMM d HH:mm") : format(d, "MMM d");
}

function safeDiv(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

function minDropForVolume(baseline: number, n: number) {
  // Cheap safeguard against noise: require drop to exceed ~2σ for the baseline.
  // This is intentionally conservative; it prevents “cry wolf” alerts on small n.
  const se = Math.sqrt((baseline * (1 - baseline)) / Math.max(1, n));
  return Math.max(ANOMALY_DROP_THRESHOLD, 2 * se);
}

export function processTransactions(
  allTransactions: Transaction[],
  filters: ProcessFilters,
): ProcessedData {
  // This is the "source of truth" for dashboard aggregates: keep it pure and
  // deterministic so we can unit-test anomaly detection and trend bucketing.
  const transactions = allTransactions.filter((txn) => {
    const ts = new Date(txn.timestamp).getTime();
    if (ts < filters.fromMs || ts > filters.toMs) return false;
    if (!transactionMatchesQuery(txn, filters.query)) return false;
    if (
      filters.paymentMethod !== "all" &&
      txn.paymentMethod !== filters.paymentMethod
    ) {
      return false;
    }
    if (filters.processor !== "all" && txn.processor !== filters.processor) {
      return false;
    }
    if (filters.outcome !== "all" && txn.status !== filters.outcome) {
      return false;
    }
    if (filters.amountMin != null && txn.amount < filters.amountMin) {
      return false;
    }
    if (filters.amountMax != null && txn.amount > filters.amountMax) {
      return false;
    }
    return true;
  });

  const totalCount = transactions.length;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const approvedCount = transactions.filter((t) => t.status === "Approved")
    .length;
  const declinedCount = transactions.filter((t) => t.status === "Declined")
    .length;
  const failedCount = transactions.filter((t) => t.status === "Failed").length;

  const byProcessor = new Map<Processor, { volume: number; count: number; approved: number }>();
  (Object.keys(PROCESSOR_METRICS) as Processor[]).forEach((p) => {
    byProcessor.set(p, { volume: 0, count: 0, approved: 0 });
  });

  for (const txn of transactions) {
    const bucket = byProcessor.get(txn.processor)!;
    bucket.volume += txn.amount;
    bucket.count += 1;
    if (txn.status === "Approved") bucket.approved += 1;
  }

  const processorVolume: ProcessorVolumeSlice[] = Array.from(byProcessor.entries())
    .map(([processor, v]) => ({
      processor,
      count: v.count,
      share: safeDiv(v.count, totalCount),
    }))
    .sort((a, b) => b.count - a.count);

  // Alerts + “recent current” bars share the same trailing window to avoid mixed
  // semantics (e.g. a green 14‑day bar while a red alert fires on the last 48h).
  const alertWindowFromMs = Math.max(
    filters.fromMs,
    filters.toMs - ALERT_WINDOW_HOURS * MS_PER_HOUR,
  );
  const recentTxns = transactions.filter((t) => {
    const ts = new Date(t.timestamp).getTime();
    return ts >= alertWindowFromMs && ts <= filters.toMs;
  });
  const recentByProcessor = new Map<
    Processor,
    { count: number; approved: number }
  >();
  (Object.keys(PROCESSOR_METRICS) as Processor[]).forEach((p) => {
    recentByProcessor.set(p, { count: 0, approved: 0 });
  });
  for (const txn of recentTxns) {
    const bucket = recentByProcessor.get(txn.processor)!;
    bucket.count += 1;
    if (txn.status === "Approved") bucket.approved += 1;
  }

  const processorApproval: ProcessorApprovalRow[] = (
    Object.keys(PROCESSOR_METRICS) as Processor[]
  ).map((processor) => {
    const v = byProcessor.get(processor)!;
    const rv = recentByProcessor.get(processor)!;
    const baseline = PROCESSOR_METRICS[processor].baselineApprovalRate;
    const current = safeDiv(v.approved, v.count);
    const recentCurrent = safeDiv(rv.approved, rv.count);
    return {
      processor,
      baseline,
      current,
      recentCurrent,
      delta: current - baseline,
      volume: v.count,
      recentVolume: rv.count,
    };
  });

  const alerts: ProcessorAlert[] = (Object.keys(PROCESSOR_METRICS) as Processor[])
    .map((processor) => {
      const baseline = PROCESSOR_METRICS[processor].baselineApprovalRate;
      const v = recentByProcessor.get(processor)!;
      const current = safeDiv(v.approved, v.count);
      const drop = baseline - current;
      return { processor, baseline, current, drop, volume: v.count };
    })
    .filter((row) => {
      if (row.volume < MIN_ALERT_VOLUME) return false;
      return row.drop > minDropForVolume(row.baseline, row.volume);
    })
    .map((row) => {
      const severity: ProcessorAlert["severity"] =
        row.drop >= 0.15 ? "critical" : "warning";
      return {
        processor: row.processor,
        severity,
        baseline: row.baseline,
        current: row.current,
        drop: row.drop,
        volume: row.volume,
      };
    })
    .sort((a, b) => b.drop - a.drop);

  const spanDays = Math.max(
    1,
    differenceInDays(new Date(filters.toMs), new Date(filters.fromMs)) + 1,
  );
  const granularity: "hour" | "day" = spanDays <= 2 ? "hour" : "day";

  const trendBuckets = new Map<string, { approved: number; total: number }>();
  for (const txn of transactions) {
    const key = bucketKey(new Date(txn.timestamp), granularity);
    const bucket = trendBuckets.get(key) ?? { approved: 0, total: 0 };
    bucket.total += 1;
    if (txn.status === "Approved") bucket.approved += 1;
    trendBuckets.set(key, bucket);
  }

  const approvalTrend: ApprovalTrendPoint[] = Array.from(trendBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      bucket: key,
      label: bucketLabel(key, granularity),
      approvalRate: safeDiv(v.approved, v.total),
      volume: v.total,
    }));

  return {
    transactions,
    totalCount,
    totalVolume,
    overallApprovalRate: safeDiv(approvedCount, totalCount),
    overallDeclineRate: safeDiv(declinedCount, totalCount),
    overallFailureRate: safeDiv(failedCount, totalCount),
    processorVolume,
    processorApproval,
    approvalTrend,
    alerts,
    granularity,
  };
}

