import { describe, expect, it } from "vitest";

import type { Transaction } from "@/lib/generateMockData";
import { filterTransactionsByQuery } from "@/lib/transactions/search";

const txns: Transaction[] = [
  {
    id: "txn_00001_abc123",
    timestamp: "2026-04-17T12:00:00.000Z",
    amount: 100_000,
    currency: "IDR",
    paymentMethod: "GoPay",
    processor: "Processor A",
    status: "Approved",
  },
  {
    id: "txn_00002_def456",
    timestamp: "2026-04-17T12:00:00.000Z",
    amount: 200_000,
    currency: "IDR",
    paymentMethod: "Visa",
    processor: "Processor B",
    status: "Declined",
  },
];

describe("filterTransactionsByQuery", () => {
  it("returns all when query is blank", () => {
    expect(filterTransactionsByQuery(txns, " ")).toEqual(txns);
  });

  it("matches by txn id", () => {
    expect(filterTransactionsByQuery(txns, "abc123")).toEqual([txns[0]]);
  });

  it("matches by processor", () => {
    expect(filterTransactionsByQuery(txns, "processor b")).toEqual([txns[1]]);
  });
});

