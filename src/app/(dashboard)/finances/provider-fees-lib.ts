import type { ProviderFeeFlowKey, ProviderFeeFlowTotals, ProviderFeePoint } from "@/lib/admin/api";

/**
 * Vocabulary for the Provider fees tab. Every amount from the API is kobo; `effectiveRate` is
 * already a percent (1.5 means 1.5% of the gross).
 */
export type FlowMeta = {
  key: ProviderFeeFlowKey;
  label: string;
  short: string;
  hint: string;
  direction: "in" | "out";
  /** CSS colour for the flow's swatch, bars and slices. */
  color: string;
};

export const FLOW_META: FlowMeta[] = [
  {
    key: "WALLET_DEPOSIT",
    label: "Wallet top-ups",
    short: "Top-ups",
    hint: "Cards and bank transfers funding wallets",
    direction: "in",
    color: "hsl(var(--chart-1))",
  },
  {
    key: "ORDER_CARD_PAYMENT",
    label: "Someone else pays",
    short: "Pay links",
    hint: "Orders paid through a shared pay link",
    direction: "in",
    color: "hsl(var(--chart-2))",
  },
  {
    key: "WEB_ORDER_PAYMENT",
    label: "Web orders",
    short: "Web",
    hint: "Send-a-parcel orders paid on pickriders.com",
    direction: "in",
    color: "hsl(var(--chart-3))",
  },
  {
    key: "WITHDRAWAL",
    label: "Withdrawals",
    short: "Withdrawals",
    hint: "Riders and customers paid out to their banks",
    direction: "out",
    color: "hsl(var(--chart-4))",
  },
  {
    key: "PLATFORM_PAYOUT",
    label: "Platform payouts",
    short: "Payouts",
    hint: "The platform wallet paid out to its own bank",
    direction: "out",
    color: "hsl(var(--chart-5))",
  },
  {
    key: "REFUND",
    label: "Card refunds",
    short: "Refunds",
    hint: "Money sent back to a payer's card",
    direction: "out",
    color: "hsl(var(--chart-6))",
  },
];

const BY_KEY = new Map(FLOW_META.map((meta) => [meta.key, meta]));

export function flowMeta(flow: string | null | undefined): FlowMeta {
  return BY_KEY.get(flow as ProviderFeeFlowKey) ?? { ...FLOW_META[0], key: flow as ProviderFeeFlowKey, label: flow ?? "Other", short: flow ?? "Other" };
}

/**
 * A fee going up is money lost, so the trend reads the other way round from revenue: up is
 * "danger", down is "success". Null when there is nothing to compare against.
 */
export function feeTrend(current: number, previous: number): { value: number; tone: "danger" | "success" | "neutral" } | null {
  if (!previous) return current ? null : { value: 0, tone: "neutral" };
  const value = Math.round(((current - previous) / previous) * 1000) / 10;
  return { value, tone: value > 0 ? "danger" : value < 0 ? "success" : "neutral" };
}

/** Each flow's share of the window's fees, as a whole percent (0 when there were no fees). */
export function feeShare(flow: Pick<ProviderFeeFlowTotals, "fees">, totalFees: number): number {
  return totalFees > 0 ? Math.round((flow.fees / totalFees) * 100) : 0;
}

/**
 * Widths for the "money in vs kept" bar: what was kept and what Paystack took, as percents of
 * the money received. A fee too small to see still gets a sliver so it is never invisible.
 */
export function keptSplit(moneyIn: number, fees: number): { kept: number; fees: number } {
  if (moneyIn <= 0) return { kept: 0, fees: 0 };
  const raw = (fees / moneyIn) * 100;
  const feesPct = fees > 0 ? Math.min(100, Math.max(raw, 1.5)) : 0;
  return { kept: Math.round((100 - feesPct) * 10) / 10, fees: Math.round(feesPct * 10) / 10 };
}

/** The series flattened for the stacked bars: one numeric key per flow. */
export function chartPoints(series: ProviderFeePoint[] | undefined): Record<string, string | number>[] {
  return (series ?? []).map((point) => {
    const row: Record<string, string | number> = { bucket: point.bucket, fees: point.fees, gross: point.gross };
    // Typed as a plain object by the generated client: fees per flow key.
    const byFlow = (point.byFlow ?? {}) as Record<string, number | undefined>;
    for (const meta of FLOW_META) row[meta.key] = Number(byFlow[meta.key] ?? 0);
    return row;
  });
}

/** Two-decimal percent for rates, which are small (0.5%, 1.5%). */
export function ratePercent(value: number | null | undefined): string {
  return `${(value ?? 0).toFixed(2)}%`;
}
