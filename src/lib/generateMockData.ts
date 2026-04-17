import { MOCK_NOW } from "@/lib/mockClock";

export type PaymentMethod =
  | "GoPay"
  | "OVO"
  | "Visa"
  | "Mastercard"
  | "Bank Transfer";

export type Processor =
  | "Processor A"
  | "Processor B"
  | "Processor C"
  | "Processor D"
  | "Processor E";

export type TransactionStatus = "Approved" | "Declined" | "Failed";

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  currency: "IDR";
  paymentMethod: PaymentMethod;
  processor: Processor;
  status: TransactionStatus;
}

export const PROCESSOR_METRICS: Record<Processor, { baselineApprovalRate: number }> = {
  "Processor A": { baselineApprovalRate: 0.9 },
  "Processor B": { baselineApprovalRate: 0.88 },
  "Processor C": { baselineApprovalRate: 0.85 },
  "Processor D": { baselineApprovalRate: 0.8 },
  "Processor E": { baselineApprovalRate: 0.75 },
};

const TRANSACTION_COUNT = 600;
const LOOKBACK_DAYS = 14;
const ANOMALY_WINDOW_HOURS = 48;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

const PAYMENT_METHODS: PaymentMethod[] = [
  "GoPay",
  "OVO",
  "Visa",
  "Mastercard",
  "Bank Transfer",
];

const PROCESSOR_DISTRIBUTION: Array<{ processor: Processor; weight: number }> = [
  { processor: "Processor A", weight: 0.4 },
  { processor: "Processor B", weight: 0.25 },
  { processor: "Processor C", weight: 0.2 },
  { processor: "Processor D", weight: 0.1 },
  { processor: "Processor E", weight: 0.05 },
];

const OVERALL_STATUS_MIX = {
  approved: 0.82,
  declined: 0.15,
  failed: 0.03,
};

const GOPAY_TO_PROCESSOR_B_RATE = 0.7;
const PROCESSOR_B_ANOMALY_APPROVAL_RATE = 0.65;

export interface MockDataOptions {
  /**
   * Seed used for deterministic generation. Same seed + same `nowMs` => same output.
   */
  seed?: number;
  /**
   * Anchor time for timestamp generation and anomaly window evaluation.
   */
  nowMs?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick<T>(
  rng: () => number,
  items: Array<{ value: T; weight: number }>,
): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function pickProcessor(rng: () => number, method: PaymentMethod): Processor {
  if (method === "GoPay" && rng() < GOPAY_TO_PROCESSOR_B_RATE) {
    return "Processor B";
  }
  return weightedPick(
    rng,
    PROCESSOR_DISTRIBUTION.map((p) => ({ value: p.processor, weight: p.weight })),
  );
}

function pickPaymentMethod(rng: () => number): PaymentMethod {
  return PAYMENT_METHODS[Math.floor(rng() * PAYMENT_METHODS.length)];
}

function randomTimestamp(rng: () => number, nowMs: number): Date {
  const offset = rng() * LOOKBACK_DAYS * MS_PER_DAY;
  return new Date(nowMs - offset);
}

function randomAmount(rng: () => number): number {
  const min = 50_000;
  const max = 5_000_000;
  return Math.round(min + rng() * (max - min));
}

function isInAnomalyWindow(nowMs: number, ts: Date): boolean {
  return nowMs - ts.getTime() <= ANOMALY_WINDOW_HOURS * MS_PER_HOUR;
}

function pickStatus(
  rng: () => number,
  processor: Processor,
  timestamp: Date,
  nowMs: number,
): TransactionStatus {
  const inAnomaly =
    processor === "Processor B" && isInAnomalyWindow(nowMs, timestamp);

  const declinedShare =
    OVERALL_STATUS_MIX.declined /
    (OVERALL_STATUS_MIX.declined + OVERALL_STATUS_MIX.failed);

  if (inAnomaly) {
    const approvalRate = PROCESSOR_B_ANOMALY_APPROVAL_RATE;
    const remaining = 1 - approvalRate;
    const roll = rng();
    if (roll < approvalRate) return "Approved";
    if (roll < approvalRate + remaining * declinedShare) return "Declined";
    return "Failed";
  }

  const baseline = PROCESSOR_METRICS[processor].baselineApprovalRate;
  const roll = rng();
  if (roll < baseline) return "Approved";
  const remaining = 1 - baseline;
  if (roll < baseline + remaining * declinedShare) {
    return "Declined";
  }
  return "Failed";
}

function makeId(rng: () => number, index: number): string {
  const rand = rng().toString(36).slice(2, 8);
  return `txn_${index.toString().padStart(5, "0")}_${rand}`;
}

export function getMockData(options: MockDataOptions = {}): Transaction[] {
  const seed = options.seed ?? 42;
  const nowMs = options.nowMs ?? MOCK_NOW.getTime();
  const rng = mulberry32(seed);
  const transactions: Transaction[] = [];

  for (let i = 0; i < TRANSACTION_COUNT; i++) {
    const paymentMethod = pickPaymentMethod(rng);
    const processor = pickProcessor(rng, paymentMethod);
    const timestamp = randomTimestamp(rng, nowMs);
    const status = pickStatus(rng, processor, timestamp, nowMs);

    transactions.push({
      id: makeId(rng, i),
      timestamp: timestamp.toISOString(),
      amount: randomAmount(rng),
      currency: "IDR",
      paymentMethod,
      processor,
      status,
    });
  }

  return transactions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
