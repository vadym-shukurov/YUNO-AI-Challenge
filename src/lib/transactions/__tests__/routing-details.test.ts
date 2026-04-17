import { describe, expect, it } from "vitest";

import { deriveRoutingDetails } from "@/lib/transactions/routing-details";
import type { Transaction } from "@/lib/generateMockData";

function txn(overrides: Partial<Transaction>): Transaction {
  return {
    id: "txn_test_1",
    timestamp: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    amount: 100_000,
    currency: "IDR",
    paymentMethod: "Visa",
    processor: "Processor A",
    status: "Approved",
    ...overrides,
  };
}

describe("deriveRoutingDetails", () => {
  it("returns deterministic details for the same transaction id", () => {
    const t = txn({ id: "txn_deterministic" });
    expect(deriveRoutingDetails(t)).toEqual(deriveRoutingDetails(t));
  });

  it("marks GoPay on Processor B as Method Pinning", () => {
    const details = deriveRoutingDetails(
      txn({
        id: "txn_gopay_b",
        paymentMethod: "GoPay",
        processor: "Processor B",
        status: "Approved",
      }),
    );

    expect(details.rule).toBe("Method Pinning");
    expect(details.acquirer).toBe("DOKU · BCA");
  });

  it("fills auth data for Approved", () => {
    const details = deriveRoutingDetails(txn({ id: "txn_auth", status: "Approved" }));
    expect(details.authCode).toMatch(/^A[A-Z0-9]{6}$/);
    expect(details.declineCode).toBeUndefined();
    expect(details.failureCode).toBeUndefined();
  });

  it("fills decline data for Declined", () => {
    const details = deriveRoutingDetails(txn({ id: "txn_declined", status: "Declined" }));
    expect(details.declineCode).toBeTruthy();
    expect(details.declineMessage).toBeTruthy();
    expect(details.authCode).toBeUndefined();
    expect(details.failureCode).toBeUndefined();
  });

  it("fills failure data for Failed and uses long response time", () => {
    const details = deriveRoutingDetails(txn({ id: "txn_failed", status: "Failed" }));
    expect(details.failureCode).toBeTruthy();
    expect(details.failureMessage).toBeTruthy();
    expect(details.responseTimeMs).toBeGreaterThanOrEqual(30_000);
  });
});

