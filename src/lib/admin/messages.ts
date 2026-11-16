import type { Tone } from "@/components/kit";
import type { TableState } from "./url-state";

/**
 * The message log page (every SMS and email handed to a provider): URL state to API query,
 * labels and tones. Pure, so the mapping is pinned by tests rather than eyeballed.
 */

/** Lagos is UTC+1 all year (no daylight saving), so a calendar day maps to a fixed instant range. */
const LAGOS_OFFSET = "+01:00";
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** First instant of a Lagos calendar day (YYYY-MM-DD) as ISO, or undefined for anything else. */
export function lagosDayStart(day: string | undefined | null): string | undefined {
  if (!day || !DAY.test(day)) return undefined;
  const date = new Date(`${day}T00:00:00.000${LAGOS_OFFSET}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Last instant of a Lagos calendar day (YYYY-MM-DD) as ISO; the core reads dateTo as inclusive. */
export function lagosDayEnd(day: string | undefined | null): string | undefined {
  if (!day || !DAY.test(day)) return undefined;
  const date = new Date(`${day}T23:59:59.999${LAGOS_OFFSET}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** The page's date range (URL `from` / `to`, Lagos days) as the core's dateFrom / dateTo. */
export function messagesRange(state: Pick<TableState, "from" | "to">): { dateFrom?: string; dateTo?: string } {
  const range: { dateFrom?: string; dateTo?: string } = {};
  const dateFrom = lagosDayStart(state.from);
  const dateTo = lagosDayEnd(state.to);
  if (dateFrom) range.dateFrom = dateFrom;
  if (dateTo) range.dateTo = dateTo;
  return range;
}

/** URL filters the list endpoint reads. Anything else in the URL (`id` for the drawer, `tab`) stays out. */
export const MESSAGE_FILTER_KEYS = ["channel", "status", "skipReason", "provider", "purpose", "template", "userId", "orderId"] as const;

/**
 * URL state to the GET admins/messages query. The table's search box is the recipient search
 * (phone or email; the core matches phones on digits). The core does not sort, so sortBy/order are
 * dropped.
 */
export function messagesQuery(state: TableState): Record<string, string | number> {
  const query: Record<string, string | number> = { page: state.page, limit: Math.min(100, state.limit) };
  for (const key of MESSAGE_FILTER_KEYS) {
    const value = state.filters[key]?.trim();
    if (value) query[key] = value;
  }
  const recipient = state.search?.trim();
  if (recipient) query.recipient = recipient;
  return { ...query, ...messagesRange(state) };
}

export const MESSAGE_CHANNEL_LABEL: Record<string, string> = { SMS: "SMS", EMAIL: "Email" };
export const MESSAGE_CHANNEL_TONE: Record<string, Tone> = { SMS: "warning", EMAIL: "info" };

export const MESSAGE_STATUS_LABEL: Record<string, string> = { QUEUED: "Queued", SENT: "Sent", FAILED: "Failed", SKIPPED: "Skipped" };
export const MESSAGE_STATUS_TONE: Record<string, Tone> = { QUEUED: "warning", SENT: "success", FAILED: "danger", SKIPPED: "neutral" };

/** Why the admin email controls held a SKIPPED message back (nothing reached the provider). */
export const MESSAGE_SKIP_REASON_LABEL: Record<string, string> = {
  DISABLED_BY_ADMIN: "Turned off by an admin",
  PAUSED_MARKETING: "Marketing emails paused",
  PAUSED_NON_ESSENTIAL: "Non-essential emails paused",
};

/** The line under a skipped row: "Held back: marketing emails paused". Empty for anything not skipped. */
export function skipLine(row: { status?: string | null; skipReason?: string | null }) {
  if (row.status !== "SKIPPED") return "";
  if (!row.skipReason) return "Held back by the email controls";
  const known = MESSAGE_SKIP_REASON_LABEL[row.skipReason];
  const reason = known ? known.charAt(0).toLowerCase() + known.slice(1) : row.skipReason.toLowerCase().replace(/_/g, " ");
  return `Held back: ${reason}`;
}

export const MESSAGE_PROVIDER_LABEL: Record<string, string> = { TERMII: "Termii", SMTP: "SMTP" };

export const MESSAGE_PURPOSE_LABEL: Record<string, string> = {
  SECURITY: "Security",
  TRANSACTIONAL: "Transactional",
  ALERT: "Staff alert",
  MARKETING: "Marketing",
  TEST: "Test send",
};

export const label = (map: Record<string, string>, value: string | null | undefined) => (value ? map[value] ?? value : "");

/** Sent / failed / queued / skipped for one channel out of the summary; zeros when the channel had nothing. */
export function channelCounts(
  byChannel: { channel: string; queued: number; sent: number; failed: number; skipped?: number; total: number }[] | null | undefined,
  channel: "SMS" | "EMAIL",
) {
  const row = (byChannel ?? []).find((entry) => entry.channel === channel);
  return { queued: row?.queued ?? 0, sent: row?.sent ?? 0, failed: row?.failed ?? 0, skipped: row?.skipped ?? 0, total: row?.total ?? 0 };
}

/** Share that failed, as a whole percent, or null when nothing finished. */
export function failureRate(counts: { sent: number; failed: number }): number | null {
  const finished = counts.sent + counts.failed;
  if (!finished) return null;
  return Math.round((counts.failed / finished) * 100);
}

/**
 * Termii reports its balance in its own units (naira for an NGN account), not kobo: it is the
 * provider's number, not ours. Shown as currency when the code is one Intl knows.
 */
export function termiiBalanceLabel(balance: { balance: number; currency?: string | null } | null | undefined): string {
  if (!balance || !Number.isFinite(balance.balance)) return "";
  const currency = balance.currency?.trim().toUpperCase();
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(balance.balance);
    } catch {
      /* not an ISO code Intl knows: fall through */
    }
  }
  const amount = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(balance.balance);
  return currency ? `${amount} ${balance.currency}` : amount;
}

/** What the subject cell shows: the subject, else the body preview, else nothing (SMS lists carry no body). */
export function messageHeadline(row: { subject?: string | null; bodyPreview?: string | null }) {
  return row.subject?.trim() || row.bodyPreview?.trim() || "";
}

/** Short form of a provider message id (SMTP ids are long `<…@host>` strings). */
export function shortProviderId(value: string | null | undefined) {
  const id = (value ?? "").replace(/^<|>$/g, "");
  if (id.length <= 18) return id;
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}
