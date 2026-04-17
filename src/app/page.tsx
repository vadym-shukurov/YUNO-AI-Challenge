import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { TransactionTable } from "@/components/transactions/transaction-table";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Live health of processors and routing rules across all payment
          methods.
        </p>
      </div>

      <DashboardOverview />
      <TransactionTable />
    </div>
  );
}
