"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFilters } from "@/lib/filters/use-filters";
import { DATE_RANGE_PRESETS, type DateRangePreset } from "@/lib/filters/types";

export function DateRangePicker() {
  const { preset, dateRange, setPreset, setCustomRange } = useFilters();
  const [open, setOpen] = React.useState(false);

  const label =
    preset === "custom"
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
      : (DATE_RANGE_PRESETS.find((p) => p.value === preset)?.label ?? "Range");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("min-w-[200px] justify-start text-left font-normal")}
          data-testid="filter-date-range"
        >
          <CalendarIcon className="h-4 w-4 opacity-70" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row">
          {DATE_RANGE_PRESETS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={preset === p.value ? "default" : "outline"}
              onClick={() => {
                setPreset(p.value as DateRangePreset);
                setOpen(false);
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          numberOfMonths={2}
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={(range: DayPickerRange | undefined) => {
            if (range?.from && range?.to) {
              setCustomRange(range.from, range.to);
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
