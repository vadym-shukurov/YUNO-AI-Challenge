"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, formatIDR } from "@/lib/utils";
import type { Transaction } from "@/lib/generateMockData";
import { deriveRoutingDetails } from "@/lib/transactions/routing-details";

export function TransactionDetailsSheet({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        {transaction ? <SheetBody transaction={transaction} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody({ transaction }: { transaction: Transaction }) {
  const details = deriveRoutingDetails(transaction);
  const statusTone =
    transaction.status === "Approved"
      ? "success"
      : transaction.status === "Declined"
        ? "destructive"
        : "muted";

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <Badge variant={statusTone}>{transaction.status}</Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {transaction.id}
          </span>
        </div>
        <SheetTitle className="text-xl">
          {formatIDR(transaction.amount)}
        </SheetTitle>
        <SheetDescription>
          {transaction.paymentMethod} · {transaction.processor} ·{" "}
          {format(new Date(transaction.timestamp), "PP HH:mm:ss")}
        </SheetDescription>
      </SheetHeader>

      <section className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Rule triggered</span>
          </div>
          <Badge variant="default">{details.rule}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <DetailLine icon={<Clock className="h-3.5 w-3.5" />} label="Response">
            {details.responseTimeMs.toLocaleString()}ms
          </DetailLine>
          <DetailLine
            icon={<ArrowRight className="h-3.5 w-3.5" />}
            label="Attempts"
          >
            {details.attempts}
          </DetailLine>
          <DetailLine
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Region"
          >
            {details.region}
          </DetailLine>
          <DetailLine
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
            label="Risk"
          >
            <span
              className={cn(
                "capitalize",
                details.risk.tier === "high" && "text-destructive",
                details.risk.tier === "medium" && "text-warning",
              )}
            >
              {details.risk.tier} ({details.risk.score})
            </span>
          </DetailLine>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Acquirer
        </h4>
        <p className="text-sm">{details.acquirer}</p>
      </section>

      {details.authCode ? (
        <section className="rounded-lg border border-success/30 bg-success/5 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">
              Authorized · {details.authCode}
            </span>
          </div>
        </section>
      ) : null}

      {details.declineCode ? (
        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">
              Decline {details.declineCode} · {details.declineMessage}
            </span>
          </div>
        </section>
      ) : null}

      {details.failureCode ? (
        <section className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Failure {details.failureCode} · {details.failureMessage}
            </span>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Routing path
        </h4>
        <ol className="space-y-2">
          {details.journey.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-md border border-border p-3"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  step.outcome === "ok" &&
                  "bg-success/15 text-emerald-950 dark:text-emerald-100",
                  step.outcome === "declined" &&
                    "bg-destructive/15 text-destructive",
                  step.outcome === "failed" && "bg-muted text-muted-foreground",
                  step.outcome === "routed" && "bg-primary/15 text-primary",
                )}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{step.step}</p>
                <p className="text-xs text-muted-foreground">
                  {step.durationMs.toLocaleString()}ms
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function DetailLine({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
