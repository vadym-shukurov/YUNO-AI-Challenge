import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const setQuery = vi.fn();

vi.mock("@/components/filters/payment-method-filter", () => ({
  PaymentMethodFilter: () => <div data-testid="payment-method-filter" />,
}));
vi.mock("@/components/filters/processor-filter", () => ({
  ProcessorFilter: () => <div data-testid="processor-filter" />,
}));
vi.mock("@/components/filters/outcome-filter", () => ({
  OutcomeFilter: () => <div data-testid="outcome-filter" />,
}));
vi.mock("@/components/filters/amount-range-filter", () => ({
  AmountRangeFilter: () => <div data-testid="amount-range-filter" />,
}));
vi.mock("@/components/filters/date-range-picker", () => ({
  DateRangePicker: () => <div data-testid="date-range-picker" />,
}));

vi.mock("@/lib/filters/use-filters", () => {
  return {
    useFilters: () => ({
      query: "",
      setQuery,
    }),
  };
});

import { Header } from "@/components/layout/header";

describe("Header", () => {
  it("wires the search input to query state", () => {
    render(<Header />);

    const input = screen.getByPlaceholderText("Search txn ID");
    fireEvent.change(input, { target: { value: "txn_123" } });

    expect(setQuery).toHaveBeenCalledWith("txn_123");
  });
});

