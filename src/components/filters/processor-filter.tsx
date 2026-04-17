"use client";

import { Split } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/lib/filters/use-filters";
import type { Processor } from "@/lib/generateMockData";

const PROCESSOR_OPTIONS: Array<Processor | "all"> = [
  "all",
  "Processor A",
  "Processor B",
  "Processor C",
  "Processor D",
  "Processor E",
];

export function ProcessorFilter() {
  const { processor, setProcessor } = useFilters();

  return (
    <Select
      value={processor}
      onValueChange={(value) => setProcessor(value as Processor | "all")}
    >
      <SelectTrigger
        className="h-8 w-[170px]"
        data-testid="filter-processor"
        aria-label="Filter by processor"
      >
        <div className="flex items-center gap-2">
          <Split className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Processor" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {PROCESSOR_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "all" ? "All processors" : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

