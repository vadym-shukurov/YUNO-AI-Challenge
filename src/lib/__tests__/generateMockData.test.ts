import { describe, expect, it } from "vitest";

import { getMockData } from "@/lib/generateMockData";
import { MOCK_NOW } from "@/lib/mockClock";

describe("getMockData", () => {
  it("is deterministic by default (stable seed + stable clock)", () => {
    const a = getMockData();
    const b = getMockData();
    expect(a).toEqual(b);
  });

  it("changes output when seed changes", () => {
    const a = getMockData({ seed: 1, nowMs: MOCK_NOW.getTime() });
    const b = getMockData({ seed: 2, nowMs: MOCK_NOW.getTime() });
    expect(a).not.toEqual(b);
  });
});

