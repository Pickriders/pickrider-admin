/**
 * Money on the core platform is stored in sub-units (kobo). Every formatter
 * here takes kobo and shows naira; nothing else in the admin should divide by
 * 100 by hand.
 */
const TZ = "Africa/Lagos";

export function naira(kobo: number | null | undefined, digits = 0) {
  const value = (kobo ?? 0) / 100;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: digits }).format(value);
}

export function nairaCompact(kobo: number | null | undefined) {
  const value = (kobo ?? 0) / 100;
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(1)}b`;
  if (abs >= 1_000_000) return `₦${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`;
  if (abs >= 10_000) return `₦${Math.round(value / 1_000)}k`;
  return naira(kobo);
}

export function count(value: number | null | undefined) {
  return new Intl.NumberFormat("en-NG").format(value ?? 0);
}

export function countCompact(value: number | null | undefined) {
  const n = value ?? 0;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1_000)}k`;
  return count(n);
}

export function percent(value: number | null | undefined, digits = 1) {
  return `${(value ?? 0).toFixed(digits)}%`;
}

export function trend(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const dateTime = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const dateTimeYear = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const dateOnly = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
const timeOnly = new Intl.DateTimeFormat("en-NG", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

export function when(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return (date.getFullYear() === new Date().getFullYear() ? dateTime : dateTimeYear).format(date);
}

export function day(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateOnly.format(date);
}

export function time(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : timeOnly.format(date);
}

export function ago(value: string | Date | null | undefined) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return day(value);
}

export function minutes(value: number | null | undefined) {
  if (value == null) return "";
  if (value < 1) return "<1 min";
  if (value < 60) return `${Math.round(value)} min`;
  const hours = Math.floor(value / 60);
  const rest = Math.round(value % 60);
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function fullName(user: { firstname?: string | null; lastname?: string | null } | null | undefined) {
  return [user?.firstname, user?.lastname].filter(Boolean).join(" ").trim();
}

export function initials(name: string | null | undefined) {
  return (name ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function maskAccount(value: string | null | undefined) {
  return value ? `•••• ${value.slice(-4)}` : "";
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  INITIATED: "Awaiting rider",
  ACCEPTED: "Rider assigned",
  ON_GOING: "In transit",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function statusLabel(status: string | null | undefined) {
  if (!status) return "";
  return ORDER_STATUS_LABEL[status] ?? status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * For the few endpoints that already answer in naira (the delivery-price
 * calculator analytics). Everything else on the platform is kobo: use naira().
 */
export function nairaUnits(value: number | null | undefined, digits = 0) {
  return naira(Math.round((value ?? 0) * 100), digits);
}
