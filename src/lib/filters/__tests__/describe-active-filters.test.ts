import { describe, expect, it } from "vitest";

import { describeActiveFilters } from "@/lib/filters/describe-active-filters";

describe("describeActiveFilters", () => {
  it("formats custom date ranges", () => {
    const text = describeActiveFilters({
      preset: "custom",
      dateRange: {
        from: new Date("2026-02-01T00:00:00.000Z"),
        to: new Date("2026-02-10T00:00:00.000Z"),
      },
      paymentMethod: "all",
      processor: "all",
      outcome: "all",
      amountMin: null,
      amountMax: null,
      query: "",
    });
    expect(text).toContain("Feb 1, 2026");
    expect(text).toContain("Feb 10, 2026");
  });

  it("includes max-only amount filters and omits empty search", () => {
    const text = describeActiveFilters({
      preset: "7d",
      dateRange: {
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-01-08T00:00:00.000Z"),
      },
      paymentMethod: "all",
      processor: "all",
      outcome: "all",
      amountMin: null,
      amountMax: 500_000,
      query: "   ",
    });
    expect(text).toContain("Last 7 days");
    expect(text).toContain("max 500,000 IDR");
    expect(text).not.toContain("Search");
  });

  it("summarizes presets, refinements, and search in plain language", () => {
    const text = describeActiveFilters({
      preset: "14d",
      dateRange: {
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-01-15T00:00:00.000Z"),
      },
      paymentMethod: "GoPay",
      processor: "Processor B",
      outcome: "Declined",
      amountMin: 100_000,
      amountMax: null,
      query: "txn_",
    });

    expect(text).toContain("Last 14 days");
    expect(text).toContain("GoPay");
    expect(text).toContain("Processor B");
    expect(text).toContain("Only Declined");
    expect(text).toContain("min 100,000 IDR");
    expect(text).toContain("Search");
  });
});
