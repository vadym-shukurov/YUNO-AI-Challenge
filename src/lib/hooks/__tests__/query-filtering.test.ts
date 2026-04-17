import { describe, expect, it } from "vitest";

import { processTransactions } from "@/lib/hooks/processed-data";
import type { Transaction } from "@/lib/generateMockData";

function t(id: string): Transaction {
  return {
    id,
    timestamp: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    amount: 100_000,
    currency: "IDR",
    paymentMethod: "Visa",
    processor: "Processor A",
    status: "Approved",
  };
}

describe("processTransactions query filtering", () => {
  it("filters transactions by id substring via query", () => {
    const all = [t("txn_alpha"), t("txn_beta"), t("other")];
    const out = processTransactions(all, {
      fromMs: new Date("2025-12-31T00:00:00.000Z").getTime(),
      toMs: new Date("2026-01-02T00:00:00.000Z").getTime(),
      paymentMethod: "all",
      processor: "all",
      outcome: "all",
      amountMin: null,
      amountMax: null,
      query: "beta",
    });

    expect(out.transactions.map((x) => x.id)).toEqual(["txn_beta"]);
  });
});

