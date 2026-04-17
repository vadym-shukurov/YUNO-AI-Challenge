import { describe, expect, it } from "vitest";

import { sanitizeNonNegativeInt } from "@/lib/filters/sanitize";

describe("sanitizeNonNegativeInt", () => {
  it("returns null for negatives", () => {
    expect(sanitizeNonNegativeInt(-1)).toBeNull();
  });

  it("returns value for zero/positive", () => {
    expect(sanitizeNonNegativeInt(0)).toBe(0);
    expect(sanitizeNonNegativeInt(10)).toBe(10);
  });

  it("returns null for null/NaN", () => {
    expect(sanitizeNonNegativeInt(null)).toBeNull();
    expect(sanitizeNonNegativeInt(Number.NaN)).toBeNull();
  });
});

