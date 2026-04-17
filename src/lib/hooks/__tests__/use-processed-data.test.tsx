import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { processTransactions } from "@/lib/hooks/processed-data";
import type { Transaction } from "@/lib/generateMockData";

vi.mock("@/lib/generateMockData", async () => {
  const actual = await vi.importActual<typeof import("@/lib/generateMockData")>(
    "@/lib/generateMockData",
  );

  const txns: Transaction[] = [
    {
      id: "txn_1",
      timestamp: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      amount: 100_000,
      currency: "IDR",
      paymentMethod: "Visa",
      processor: "Processor A",
      status: "Approved",
    },
    {
      id: "txn_2",
      timestamp: new Date("2026-01-01T01:00:00.000Z").toISOString(),
      amount: 250_000,
      currency: "IDR",
      paymentMethod: "Visa",
      processor: "Processor B",
      status: "Declined",
    },
  ];

  return {
    ...actual,
    getMockData: () => txns,
  };
});

vi.mock("@/lib/filters/use-filters", () => {
  return {
    useFilters: () => ({
      dateRange: {
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-01-02T00:00:00.000Z"),
      },
      paymentMethod: "all",
      processor: "all",
      outcome: "all",
      amountMin: null,
      amountMax: null,
      query: "",
    }),
  };
});

import { useProcessedData } from "@/lib/hooks/use-processed-data";
import { getMockData } from "@/lib/generateMockData";

describe("useProcessedData", () => {
  it("composes filters + mock data through processTransactions", () => {
    const allTransactions = getMockData();
    const expected = processTransactions(allTransactions, {
      fromMs: new Date("2026-01-01T00:00:00.000Z").getTime(),
      toMs: new Date("2026-01-02T00:00:00.000Z").getTime(),
      paymentMethod: "all",
      processor: "all",
      outcome: "all",
      amountMin: null,
      amountMax: null,
      query: "",
    });

    const { result } = renderHook(() => useProcessedData());
    expect(result.current).toEqual(expected);
  });
});

