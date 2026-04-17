import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Minimal in-memory querystring state for the tests.
type Store = Record<string, unknown>;

function createNuqsMock(initial: Store) {
  const store: Store = { ...initial };
  const setters: Record<string, ReturnType<typeof vi.fn>> = {};

  const useQueryState = (
    key: string,
    parser?: { parse?: (v: unknown) => unknown; serialize?: (v: unknown) => unknown },
  ) => {
    const current = store[key] ?? null;
    const parsed = parser?.parse ? parser.parse(current) : current;
    const setter =
      setters[key] ??
      (setters[key] = vi.fn(async (next: unknown) => {
      const serialized = parser?.serialize ? parser.serialize(next) : next;
      store[key] = serialized === "" ? null : serialized;
    }));
    return [parsed, setter] as const;
  };

  return { store, setters, useQueryState };
}

vi.mock("nuqs", () => {
  // The hook under test only relies on these APIs and the fact that
  // `useQueryState` returns `[value, setValue]`.
  const parseAsString = {
    parse: (v: unknown) => (typeof v === "string" ? v : null),
    serialize: (v: unknown) => (typeof v === "string" ? v : v == null ? null : String(v)),
  };
  const parseAsInteger = {
    parse: (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : null),
    serialize: (v: unknown) => (v == null ? null : String(v)),
  };
  const parseAsStringLiteral = (allowed: readonly string[]) => ({
    parse: (v: unknown) => (typeof v === "string" && allowed.includes(v) ? v : null),
    withDefault: (def: string) => ({
      parse: (v: unknown) => (typeof v === "string" && allowed.includes(v) ? v : def),
    }),
  });

  // This will be overwritten per-test via `globalThis.__nuqsMock`.
  const getMock = () => (globalThis as any).__nuqsMock as ReturnType<typeof createNuqsMock>;

  return {
    parseAsString,
    parseAsInteger,
    parseAsStringLiteral,
    useQueryState: (...args: any[]) => (getMock() as any).useQueryState.apply(null, args),
  };
});

import { useFilters } from "@/lib/filters/use-filters";

describe("useFilters", () => {
  it("defaults to 14d preset and resolves a date range", () => {
    (globalThis as any).__nuqsMock = createNuqsMock({});

    const { result } = renderHook(() => useFilters());
    expect(result.current.preset).toBe("14d");
    expect(result.current.dateRange.from).toBeInstanceOf(Date);
    expect(result.current.dateRange.to).toBeInstanceOf(Date);
  });

  it("canonicalizes negative min/max by clearing them", async () => {
    const nuqs = createNuqsMock({ min: -10, max: -1 });
    (globalThis as any).__nuqsMock = nuqs;

    const { result } = renderHook(() => useFilters());
    expect(result.current.amountMin).toBeNull();
    expect(result.current.amountMax).toBeNull();

    await waitFor(() => {
      expect(nuqs.setters.min).toHaveBeenCalledWith(null);
      expect(nuqs.setters.max).toHaveBeenCalledWith(null);
    });
  });

  it("setQuery trims whitespace and clears empty values", () => {
    (globalThis as any).__nuqsMock = createNuqsMock({});

    const { result } = renderHook(() => useFilters());
    result.current.setQuery("   ");
    result.current.setQuery("  abc  ");

    // Our nuqs mock stores raw values; the behavior we care about is:
    // - empty -> null
    // - non-empty -> trimmed string
    expect(((globalThis as any).__nuqsMock.store.q as any) ?? null).toBe("abc");
  });

  it("serializes numeric min/max when set via setters", () => {
    const nuqs = createNuqsMock({});
    (globalThis as any).__nuqsMock = nuqs;

    const { result } = renderHook(() => useFilters());
    result.current.setAmountMin(123);
    result.current.setAmountMax(null);

    // Ensure our parser's serialize path executed (values stored as query-friendly).
    return waitFor(() => {
      expect(nuqs.store.min).toBe("123");
      expect(nuqs.store.max).toBeNull();
    });
  });
});

