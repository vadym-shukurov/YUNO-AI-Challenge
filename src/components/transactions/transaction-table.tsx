"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatIDR } from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/lib/generateMockData";
import { useProcessedData } from "@/lib/hooks/use-processed-data";
import { useFilters } from "@/lib/filters/use-filters";

import { TransactionDetailsSheet } from "./transaction-details-sheet";

const STATUS_VARIANT: Record<TransactionStatus, BadgeProps["variant"]> = {
  Approved: "success",
  Declined: "destructive",
  Failed: "muted",
};

const STATUS_ROW_TINT: Record<TransactionStatus, string> = {
  Approved: "",
  Declined: "bg-destructive/[0.03]",
  Failed: "bg-muted/30",
};

function columns(): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "id",
      header: "Transaction",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "timestamp",
      header: "Time",
      enableSorting: true,
      sortingFn: "basic",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(row.original.timestamp), "MMM d, HH:mm")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {format(new Date(row.original.timestamp), "yyyy")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {formatIDR(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      enableSorting: true,
      sortingFn: "alphanumeric",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.paymentMethod}</Badge>
      ),
    },
    {
      accessorKey: "processor",
      header: "Processor",
      enableSorting: true,
      sortingFn: "alphanumeric",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.processor}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
  ];
}

export function TransactionTable() {
  const { transactions } = useProcessedData();
  const { query, setQuery } = useFilters();

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [selected, setSelected] = React.useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const table = useReactTable({
    data: transactions,
    columns: columns(),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = transactions.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(total, (pageIndex + 1) * pageSize);

  const openRow = (txn: Transaction) => {
    setSelected(txn);
    setSheetOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>
            Inspect individual transactions. Click any row for the full routing
            path.
          </CardDescription>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              table.setPageIndex(0);
            }}
            placeholder="Search txn ID or processor"
            data-testid="table-search"
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="bg-muted/40 hover:bg-muted/40">
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIcon sort={header.column.getIsSorted()} />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No transactions match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => openRow(row.original)}
                    data-testid="txn-row"
                    className={cn(
                      "cursor-pointer",
                      STATUS_ROW_TINT[row.original.status],
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{start}</span>
            –<span className="font-medium text-foreground">{end}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <TransactionDetailsSheet
        transaction={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </Card>
  );
}

function SortIcon({ sort }: { sort: false | "asc" | "desc" }) {
  if (sort === "asc") return <ArrowUp className="h-3 w-3" />;
  if (sort === "desc") return <ArrowDown className="h-3 w-3" />;
  return <ArrowUpDown className="h-3 w-3 opacity-50" />;
}
