import type { Transaction } from "@/lib/admin/api";
import type { RangeValue } from "@/components/kit";

/**
 * Shared vocabulary for the Finances section. Every amount coming from the
 * API is kobo; the only place naira enters is what the admin types, and
 * `toKobo` is the single conversion point for that.
 */
export const TX_STATUSES = ["PROCESSING", "SUCCESS", "FAILED", "CANCELLED"] as const;
export const TX_TYPES = ["CREDIT", "DEBIT"] as const;
export const TX_CATEGORIES = ["FEE", "DEPOSIT", "WITHDRAWAL", "REVERSAL", "CHARGE"] as const;

export const TX_PURPOSES: { value: string; label: string }[] = [
  { value: "ORDER_EARNING", label: "Order earning" },
  { value: "WALLET_FUNDING", label: "Wallet funding" },
  { value: "WALLET_WITHDRAWAL", label: "Wallet withdrawal" },
  { value: "REFERRAL_BONUS", label: "Referral bonus" },
  { value: "ORDER_PAYMENT", label: "Order payment" },
  { value: "ORDER_EXTERNAL_FUNDING", label: "Paid by someone else" },
  { value: "ORDER_PAYMENT_REFUND", label: "Order refund" },
  { value: "ORDER_EARNING_SPLIT", label: "Order earning split" },
  { value: "ORDER_DISCOUNT", label: "Order discount" },
  { value: "PROVIDER_DEPOSIT_FEE", label: "Provider deposit fee" },
  { value: "PROVIDER_WITHDRAWAL_FEE", label: "Provider withdrawal fee" },
  { value: "ORDER_SERVICE_CHARGE", label: "Order service charge" },
  { value: "PLATFORM_TRANSFER", label: "Platform transfer" },
];

const PURPOSE_LABEL = new Map(TX_PURPOSES.map((p) => [p.value, p.label]));

export function titleCase(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function purposeLabel(purpose: string | null | undefined) {
  if (!purpose) return "";
  return PURPOSE_LABEL.get(purpose) ?? titleCase(purpose);
}

/** Naira typed by an admin to kobo for the API; null when it is not a usable amount. */
export function toKobo(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

/** What the transactions metrics endpoints take for a picked range. */
export function rangeToDateRange(range: RangeValue): string | undefined {
  if (range.all) return undefined;
  const parts = [range.from, range.to].filter(Boolean);
  return parts.length ? parts.join(",") : undefined;
}

export function isObjectId(value: string | null | undefined) {
  return /^[a-f\d]{24}$/i.test(value ?? "");
}

/** Purposes only a rider's wallet ever carries; used to pick the detail page. */
const RIDER_PURPOSES = new Set(["ORDER_EARNING", "ORDER_EARNING_SPLIT", "WALLET_WITHDRAWAL"]);

/**
 * The list endpoint does not populate the wallet owner, so the link is a best
 * guess from entityType and purpose. The platform's own wallet gets no link.
 */
export function entityHref(tx: Pick<Transaction, "entityId" | "entityType" | "purpose">, platformEntityId?: string) {
  if (!tx.entityId || tx.entityId === platformEntityId) return undefined;
  if (tx.entityType === "BUSINESS") return `/business/${tx.entityId}`;
  if (tx.entityType === "USER") {
    return RIDER_PURPOSES.has(tx.purpose) ? `/couriers/${tx.entityId}/details` : `/customers/${tx.entityId}`;
  }
  return undefined;
}

export function entityLabel(tx: Pick<Transaction, "entityId" | "entityType">, platformEntityId?: string) {
  if (tx.entityId && tx.entityId === platformEntityId) return "Platform wallet";
  return titleCase(tx.entityType) || "Wallet";
}

/** Where a withdrawal went, read from the provider metadata when present. */
export function destinationOf(tx: Transaction) {
  const meta = (tx.metadata ?? {}) as Record<string, unknown>;
  const bank = meta.bankName ?? meta.bank ?? meta.accountName;
  const account = meta.accountNumber ?? meta.account;
  const parts = [bank, account].filter((v) => typeof v === "string" && v).map(String);
  if (parts.length) return parts.join(" · ");
  return tx.description ?? "";
}
