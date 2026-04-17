"use client";

import { useMemo } from "react";

import {
  getMockData,
  type Transaction,
} from "@/lib/generateMockData";
import { useFilters } from "@/lib/filters/use-filters";
import {
  ALERT_WINDOW_HOURS,
  ANOMALY_DROP_THRESHOLD,
  MIN_ALERT_VOLUME,
  processTransactions,
  type ApprovalTrendPoint,
  type ProcessedData,
  type ProcessorAlert,
  type ProcessorApprovalRow,
  type ProcessorVolumeSlice,
} from "./processed-data";

export { ALERT_WINDOW_HOURS, ANOMALY_DROP_THRESHOLD, MIN_ALERT_VOLUME };
export type {
  ApprovalTrendPoint,
  ProcessedData,
  ProcessorAlert,
  ProcessorApprovalRow,
  ProcessorVolumeSlice,
};

export function useProcessedData(): ProcessedData {
  const {
    dateRange,
    paymentMethod,
    processor,
    outcome,
    amountMin,
    amountMax,
    query,
  } = useFilters();

  const allTransactions = useMemo(() => getMockData(), []);

  return useMemo(() => {
    return processTransactions(allTransactions, {
      fromMs: dateRange.from.getTime(),
      toMs: dateRange.to.getTime(),
      paymentMethod,
      processor,
      outcome,
      amountMin,
      amountMax,
      query,
    });
  }, [
    allTransactions,
    dateRange.from,
    dateRange.to,
    paymentMethod,
    processor,
    outcome,
    amountMin,
    amountMax,
    query,
  ]);
}
