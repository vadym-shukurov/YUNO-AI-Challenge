"use client";

import * as React from "react";
import { Coins } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useFilters } from "@/lib/filters/use-filters";

function normalizeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(/[, ]+/g, ""));
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return Math.floor(n);
}

export function AmountRangeFilter() {
  const { amountMin, amountMax, setAmountMin, setAmountMax } = useFilters();

  const [minUi, setMinUi] = React.useState(amountMin?.toString() ?? "");
  const [maxUi, setMaxUi] = React.useState(amountMax?.toString() ?? "");

  React.useEffect(() => {
    setMinUi(amountMin?.toString() ?? "");
  }, [amountMin]);
  React.useEffect(() => {
    setMaxUi(amountMax?.toString() ?? "");
  }, [amountMax]);

  return (
    <div
      className="flex h-8 items-center gap-2 rounded-md border border-input bg-background px-2 shadow-sm"
      data-testid="filter-amount"
    >
      <Coins className="h-4 w-4 text-muted-foreground" />
      <Input
        value={minUi}
        onChange={(e) => setMinUi(e.target.value)}
        onBlur={() => setAmountMin(normalizeNumber(minUi))}
        inputMode="numeric"
        placeholder="Min IDR"
        data-testid="filter-amount-min"
        className="h-7 w-[110px] border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
      />
      <span className="text-xs text-muted-foreground">–</span>
      <Input
        value={maxUi}
        onChange={(e) => setMaxUi(e.target.value)}
        onBlur={() => setAmountMax(normalizeNumber(maxUi))}
        inputMode="numeric"
        placeholder="Max IDR"
        data-testid="filter-amount-max"
        className="h-7 w-[110px] border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

