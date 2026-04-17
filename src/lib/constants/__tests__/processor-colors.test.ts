import { describe, expect, it } from "vitest";

import { PROCESSOR_COLORS } from "@/lib/constants/processor-colors";

describe("PROCESSOR_COLORS", () => {
  it("defines a stable color for every processor", () => {
    expect(Object.keys(PROCESSOR_COLORS).sort()).toEqual(
      ["Processor A", "Processor B", "Processor C", "Processor D", "Processor E"].sort(),
    );

    for (const color of Object.values(PROCESSOR_COLORS)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

