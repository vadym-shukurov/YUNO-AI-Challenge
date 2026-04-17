"use client";

import { useEffect, useMemo } from "react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { subDays, subHours, startOfDay, endOfDay } from "date-fns";

import type {
  PaymentMethod,
  Processor,
  TransactionStatus,
} from "@/lib/generateMockData";
import { MOCK_NOW } from "@/lib/mockClock";
import { sanitizeNonNegativeInt } from "@/lib/filters/sanitize";
import {
  DATE_RANGE_PRESETS,
  PAYMENT_METHOD_OPTIONS,
  type DateRange,
  type DateRangePreset,
} from "./types";

const PRESET_VALUES = DATE_RANGE_PRESETS.map((p) => p.value) as [
  DateRangePreset,
  ...DateRangePreset[],
];

const METHOD_VALUES = PAYMENT_METHOD_OPTIONS as unknown as [
  PaymentMethod | "all",
  ...(PaymentMethod | "all")[],
];

const PROCESSOR_VALUES = [
  "all",
  "Processor A",
  "Processor B",
  "Processor C",
  "Processor D",
  "Processor E",
] as const satisfies readonly (Processor | "all")[];

const OUTCOME_VALUES = ["all", "Approved", "Declined", "Failed"] as const satisfies readonly (
  | TransactionStatus
  | "all"
)[];

function resolveRange(
  preset: DateRangePreset,
  fromIso: string | null,
  toIso: string | null,
): DateRange {
  // Use a fixed "now" in this prototype so mock-data + filters are deterministic
  // in screenshots/tests and the anomaly window doesn't drift day-to-day.
  const now = MOCK_NOW;
  switch (preset) {
    case "24h":
      return { from: subHours(now, 24), to: now };
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: now };
    case "14d":
      return { from: startOfDay(subDays(now, 13)), to: now };
    case "custom": {
      // For custom ranges we keep "sane defaults" so a partially-specified URL
      // (only from/to) still yields a useful view.
      const from = fromIso ? new Date(fromIso) : startOfDay(subDays(now, 13));
      const to = toIso ? new Date(toIso) : endOfDay(now);
      return { from, to };
    }
  }
}

export function useFilters() {
  const [preset, setPreset] = useQueryState(
    "range",
    parseAsStringLiteral(PRESET_VALUES).withDefault("14d"),
  );
  const [fromIso, setFromIso] = useQueryState("from", parseAsString);
  const [toIso, setToIso] = useQueryState("to", parseAsString);
  const [paymentMethod, setPaymentMethod] = useQueryState(
    "method",
    parseAsStringLiteral(METHOD_VALUES).withDefault("all"),
  );
  const [processor, setProcessor] = useQueryState(
    "processor",
    parseAsStringLiteral(PROCESSOR_VALUES).withDefault("all"),
  );
  const [outcome, setOutcome] = useQueryState(
    "outcome",
    parseAsStringLiteral(OUTCOME_VALUES).withDefault("all"),
  );
  const [amountMinRaw, setAmountMinRaw] = useQueryState("min", parseAsInteger);
  const [amountMaxRaw, setAmountMaxRaw] = useQueryState("max", parseAsInteger);
  const [queryRaw, setQueryRaw] = useQueryState("q", parseAsString);

  const dateRange = useMemo(
    () => resolveRange(preset, fromIso, toIso),
    [preset, fromIso, toIso],
  );

  const amountMin = useMemo(
    () => sanitizeNonNegativeInt(amountMinRaw),
    [amountMinRaw],
  );
  const amountMax = useMemo(
    () => sanitizeNonNegativeInt(amountMaxRaw),
    [amountMaxRaw],
  );
  const query = queryRaw ?? "";

  // Keep shareable URLs canonical (no negative min/max).
  useEffect(() => {
    if (amountMinRaw != null && amountMinRaw < 0) {
      void setAmountMinRaw(null);
    }
  }, [amountMinRaw, setAmountMinRaw]);
  useEffect(() => {
    if (amountMaxRaw != null && amountMaxRaw < 0) {
      void setAmountMaxRaw(null);
    }
  }, [amountMaxRaw, setAmountMaxRaw]);

  return {
    preset,
    dateRange,
    paymentMethod,
    processor,
    outcome,
    amountMin,
    amountMax,
    query,
    setPreset: (next: DateRangePreset) => {
      void setPreset(next);
      if (next !== "custom") {
        void setFromIso(null);
        void setToIso(null);
      }
    },
    setCustomRange: (from: Date, to: Date) => {
      void setPreset("custom");
      void setFromIso(from.toISOString());
      void setToIso(to.toISOString());
    },
    setPaymentMethod: (next: PaymentMethod | "all") => {
      void setPaymentMethod(next);
    },
    setProcessor: (next: Processor | "all") => {
      void setProcessor(next);
    },
    setOutcome: (next: TransactionStatus | "all") => {
      void setOutcome(next);
    },
    setAmountMin: (next: number | null) => {
      void setAmountMinRaw(sanitizeNonNegativeInt(next));
    },
    setAmountMax: (next: number | null) => {
      void setAmountMaxRaw(sanitizeNonNegativeInt(next));
    },
    setQuery: (next: string) => {
      const trimmed = next.trim();
      void setQueryRaw(trimmed ? trimmed : null);
    },
  };
}
