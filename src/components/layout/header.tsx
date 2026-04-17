"use client";

import React from "react";
import { Bell, Search } from "lucide-react";

import { AmountRangeFilter } from "@/components/filters/amount-range-filter";
import { DateRangePicker } from "@/components/filters/date-range-picker";
import { OutcomeFilter } from "@/components/filters/outcome-filter";
import { PaymentMethodFilter } from "@/components/filters/payment-method-filter";
import { ProcessorFilter } from "@/components/filters/processor-filter";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/lib/filters/use-filters";

export function Header() {
  const { query, setQuery } = useFilters();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="text-base font-semibold tracking-tight">
          Payment Orchestration
        </h1>
        <span className="hidden rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          Indonesia · IDR
        </span>
      </div>
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search txn ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <PaymentMethodFilter />
        <ProcessorFilter />
        <OutcomeFilter />
        <AmountRangeFilter />
        <DateRangePicker />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
