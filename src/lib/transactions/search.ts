import type { Transaction } from "@/lib/generateMockData";

export function transactionMatchesQuery(txn: Transaction, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    txn.id.toLowerCase().includes(needle) ||
    txn.processor.toLowerCase().includes(needle)
  );
}

export function filterTransactionsByQuery(
  txns: Transaction[],
  query: string,
): Transaction[] {
  const needle = query.trim();
  if (!needle) return txns;
  return txns.filter((t) => transactionMatchesQuery(t, needle));
}

