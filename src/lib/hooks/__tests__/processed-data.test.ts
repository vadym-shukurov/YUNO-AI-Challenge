import { describe, expect, it } from "vitest";

import { getMockData } from "@/lib/generateMockData";
import { MOCK_NOW } from "@/lib/mockClock";
import { processTransactions } from "@/lib/hooks/processed-data";

describe("processTransactions", () => {
  const all = getMockData({ seed: 42, nowMs: MOCK_NOW.getTime() });
  const baseFilters = {
    fromMs: MOCK_NOW.getTime() - 14 * 24 * 60 * 60 * 1000,
    toMs: MOCK_NOW.getTime(),
    paymentMethod: "all" as const,
    processor: "all" as const,
    outcome: "all" as const,
    amountMin: null,
    amountMax: null,
    query: "",
  };

  it("filters by processor", () => {
    const out = processTransactions(all, { ...baseFilters, processor: "Processor A" });
    expect(out.transactions.length).toBeGreaterThan(0);
    expect(new Set(out.transactions.map((t) => t.processor))).toEqual(
      new Set(["Processor A"]),
    );
  });

  it("filters by outcome", () => {
    const out = processTransactions(all, { ...baseFilters, outcome: "Declined" });
    expect(out.transactions.length).toBeGreaterThan(0);
    expect(new Set(out.transactions.map((t) => t.status))).toEqual(
      new Set(["Declined"]),
    );
  });

  it("filters by amount range", () => {
    const out = processTransactions(all, {
      ...baseFilters,
      amountMin: 200_000,
      amountMax: 300_000,
    });
    expect(out.transactions.length).toBeGreaterThan(0);
    expect(out.transactions.every((t) => t.amount >= 200_000 && t.amount <= 300_000)).toBe(true);
  });

  it("only flags Processor B as anomalous in the seeded dataset", () => {
    const out = processTransactions(all, baseFilters);
    expect(out.alerts.length).toBeGreaterThan(0);
    expect(new Set(out.alerts.map((a) => a.processor))).toEqual(
      new Set(["Processor B"]),
    );
  });

  it("exposes recent-window approval metrics aligned with alerts", () => {
    const out = processTransactions(all, baseFilters);
    const rowB = out.processorApproval.find((r) => r.processor === "Processor B");
    expect(rowB).toBeTruthy();
    expect(rowB!.recentVolume).toBeGreaterThan(0);
    expect(rowB!.recentCurrent).toBeGreaterThanOrEqual(0);
    expect(rowB!.recentCurrent).toBeLessThanOrEqual(1);
  });
});

