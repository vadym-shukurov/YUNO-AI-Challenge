import { format } from "date-fns";

import type { DateRangePreset } from "@/lib/filters/types";

export interface ActiveFilterSnapshot {
  preset: DateRangePreset;
  dateRange: { from: Date; to: Date };
  paymentMethod: string;
  processor: string;
  outcome: string;
  amountMin: number | null;
  amountMax: number | null;
  query: string;
}

/**
 * Plain-language summary for business users. Charts and KPIs always reflect
 * whatever is selected here (URL-synced via `useFilters`).
 */
export function describeActiveFilters(f: ActiveFilterSnapshot): string {
  const presetLabel: Record<DateRangePreset, string> = {
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "14d": "Last 14 days",
    custom: `${format(f.dateRange.from, "MMM d, yyyy")}–${format(f.dateRange.to, "MMM d, yyyy")}`,
  };
  const range = presetLabel[f.preset];

  const method = f.paymentMethod === "all" ? "All payment methods" : f.paymentMethod;
  const processor = f.processor === "all" ? "All processors" : f.processor;
  const outcome = f.outcome === "all" ? "All outcomes" : `Only ${f.outcome}`;

  const amountParts: string[] = [];
  if (f.amountMin != null) amountParts.push(`min ${f.amountMin.toLocaleString("en-US")} IDR`);
  if (f.amountMax != null) amountParts.push(`max ${f.amountMax.toLocaleString("en-US")} IDR`);
  const amount = amountParts.length ? amountParts.join(" · ") : null;

  const q = f.query.trim() ? `Search “${f.query.trim()}”` : null;

  return [range, method, processor, outcome, amount, q].filter(Boolean).join(" · ");
}
