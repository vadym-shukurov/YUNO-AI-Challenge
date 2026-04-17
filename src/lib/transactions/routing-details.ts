import type { Processor, Transaction } from "@/lib/generateMockData";

const ROUTING_RULES = [
  "Cost Optimization",
  "Highest Approval",
  "Primary Routing",
  "Method Pinning",
  "Lowest Latency",
  "Fallback Retry",
] as const;

const DECLINE_REASONS = [
  { code: "05", message: "Do not honor" },
  { code: "51", message: "Insufficient funds" },
  { code: "54", message: "Expired card" },
  { code: "14", message: "Invalid card number" },
  { code: "61", message: "Exceeds withdrawal limit" },
  { code: "R01", message: "Issuer risk decline" },
];

const FAILURE_REASONS = [
  { code: "TIMEOUT", message: "Processor timeout (>30s)" },
  { code: "5XX", message: "Processor returned 502" },
  { code: "NETWORK", message: "Network unreachable" },
  { code: "SCHEMA", message: "Malformed response payload" },
];

const PROCESSOR_ACQUIRERS: Record<Processor, string> = {
  "Processor A": "Xendit · Bank Mandiri",
  "Processor B": "DOKU · BCA",
  "Processor C": "Midtrans · BNI",
  "Processor D": "Faspay · BRI",
  "Processor E": "Finpay · CIMB Niaga",
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function pickRule(txn: Transaction, seed: number) {
  if (txn.paymentMethod === "GoPay" && txn.processor === "Processor B") {
    return "Method Pinning";
  }
  if (txn.status === "Failed") return "Fallback Retry";
  return pick(ROUTING_RULES, seed);
}

export interface RoutingDetails {
  rule: (typeof ROUTING_RULES)[number];
  responseTimeMs: number;
  attempts: number;
  acquirer: string;
  authCode?: string;
  declineCode?: string;
  declineMessage?: string;
  failureCode?: string;
  failureMessage?: string;
  region: string;
  risk: {
    score: number;
    tier: "low" | "medium" | "high";
  };
  journey: Array<{
    step: string;
    processor?: Processor;
    outcome: "ok" | "declined" | "failed" | "routed";
    durationMs: number;
  }>;
}

export function deriveRoutingDetails(txn: Transaction): RoutingDetails {
  const seed = hashString(txn.id);
  const rule = pickRule(txn, seed);

  const baseLatency =
    {
      "Processor A": 180,
      "Processor B": 260,
      "Processor C": 210,
      "Processor D": 340,
      "Processor E": 410,
    }[txn.processor] ?? 250;
  const jitter = (seed % 140) - 50;
  const responseTimeMs =
    txn.status === "Failed" ? 30_000 + (seed % 3000) : baseLatency + jitter;

  const attempts = txn.status === "Failed" && seed % 3 === 0 ? 2 : 1;

  const riskScore = seed % 100;
  const riskTier: "low" | "medium" | "high" =
    riskScore < 55 ? "low" : riskScore < 85 ? "medium" : "high";

  const journey: RoutingDetails["journey"] = [
    {
      step: `Risk evaluation (${riskTier})`,
      outcome: "ok",
      durationMs: 12 + (seed % 18),
    },
    {
      step: `Routing rule matched: ${rule}`,
      outcome: "routed",
      durationMs: 4 + (seed % 6),
    },
    {
      step: `Forwarded to ${txn.processor}`,
      processor: txn.processor,
      outcome:
        txn.status === "Approved"
          ? "ok"
          : txn.status === "Declined"
            ? "declined"
            : "failed",
      durationMs: responseTimeMs,
    },
  ];

  if (attempts === 2) {
    journey.push({
      step: "Fallback retry on Processor A",
      processor: "Processor A",
      outcome: "ok",
      durationMs: 210,
    });
  }

  const details: RoutingDetails = {
    rule,
    responseTimeMs,
    attempts,
    acquirer: PROCESSOR_ACQUIRERS[txn.processor],
    region: "ID-JK · Jakarta",
    risk: { score: riskScore, tier: riskTier },
    journey,
  };

  if (txn.status === "Approved") {
    details.authCode = `A${(seed % 1_000_000).toString(36).toUpperCase().padStart(6, "0")}`;
  } else if (txn.status === "Declined") {
    const reason = pick(DECLINE_REASONS, seed);
    details.declineCode = reason.code;
    details.declineMessage = reason.message;
  } else {
    const reason = pick(FAILURE_REASONS, seed);
    details.failureCode = reason.code;
    details.failureMessage = reason.message;
  }

  return details;
}
