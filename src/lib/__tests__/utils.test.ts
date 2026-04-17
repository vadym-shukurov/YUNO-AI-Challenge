import { describe, expect, it } from "vitest";

import { cn, formatIDR, formatNumber, formatPercent } from "@/lib/utils";

describe("utils", () => {
  it("cn merges conditional classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("formatIDR formats in Indonesian Rupiah without decimals", () => {
    const formatted = formatIDR(150_000);
    expect(formatted).toMatch(/Rp/);
    // Ensure we didn't get decimal cents (either ",00" or ".00") in any locale.
    expect(formatted).not.toMatch(/[,.]\d{2}$/);
  });

  it("formatNumber uses en-US grouping", () => {
    expect(formatNumber(1_234_567)).toBe("1,234,567");
  });

  it("formatPercent converts fraction to percentage string", () => {
    expect(formatPercent(0.825, 1)).toBe("82.5%");
    expect(formatPercent(0.1, 0)).toBe("10%");
  });
});

