"use client";

import { Wallet } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/lib/filters/use-filters";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/filters/types";
import type { PaymentMethod } from "@/lib/generateMockData";

export function PaymentMethodFilter() {
  const { paymentMethod, setPaymentMethod } = useFilters();

  return (
    <Select
      value={paymentMethod}
      onValueChange={(value) => setPaymentMethod(value as PaymentMethod | "all")}
    >
      <SelectTrigger className="h-8 w-[170px]" data-testid="filter-method">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Payment method" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "all" ? "All methods" : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
