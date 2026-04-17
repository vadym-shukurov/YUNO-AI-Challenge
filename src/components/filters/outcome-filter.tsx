"use client";

import * as React from "react";
import { BadgeCheck, Ban, TriangleAlert, XCircle } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/lib/filters/use-filters";
import type { TransactionStatus } from "@/lib/generateMockData";

const OUTCOME_OPTIONS: Array<TransactionStatus | "all"> = [
  "all",
  "Approved",
  "Declined",
  "Failed",
];

const ICON: Record<TransactionStatus | "all", React.ReactNode> = {
  all: <TriangleAlert className="h-4 w-4 text-muted-foreground" />,
  Approved: <BadgeCheck className="h-4 w-4 text-muted-foreground" />,
  Declined: <Ban className="h-4 w-4 text-muted-foreground" />,
  Failed: <XCircle className="h-4 w-4 text-muted-foreground" />,
};

export function OutcomeFilter() {
  const { outcome, setOutcome } = useFilters();

  return (
    <Select
      value={outcome}
      onValueChange={(value) => setOutcome(value as TransactionStatus | "all")}
    >
      <SelectTrigger
        className="h-8 w-[160px]"
        data-testid="filter-outcome"
        aria-label="Filter by transaction outcome"
      >
        <div className="flex items-center gap-2">
          {ICON[outcome]}
          <SelectValue placeholder="Outcome" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {OUTCOME_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "all" ? "All outcomes" : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

