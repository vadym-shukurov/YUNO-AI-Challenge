import type { PaymentMethod } from "@/lib/generateMockData";

export type DateRangePreset = "24h" | "7d" | "14d" | "custom";

export const PAYMENT_METHOD_OPTIONS: Array<PaymentMethod | "all"> = [
  "all",
  "GoPay",
  "OVO",
  "Visa",
  "Mastercard",
  "Bank Transfer",
];

export const DATE_RANGE_PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
];

export interface DateRange {
  from: Date;
  to: Date;
}
