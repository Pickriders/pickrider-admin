"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge, type ColumnMeta, type Tone } from "@/components/kit";
import type { Coupon, CouponLifecycle } from "@/lib/admin/api";
import { count, day, naira, percent } from "@/lib/admin/format";

export const LIFECYCLE_LABEL: Record<CouponLifecycle, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  EXHAUSTED: "Fully redeemed",
  INACTIVE: "Paused",
};
export const LIFECYCLE_TONE: Record<CouponLifecycle, Tone> = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  EXHAUSTED: "info",
  INACTIVE: "warning",
};
export const LIFECYCLE_OPTIONS = (Object.keys(LIFECYCLE_LABEL) as CouponLifecycle[]).map((value) => ({
  value,
  label: LIFECYCLE_LABEL[value],
}));

/** "10% off (max ₦2,000)" or "₦500 off". */
export function discountLabel(coupon: Pick<Coupon, "type" | "value" | "maxDiscount">) {
  if (coupon.type === "PERCENTAGE")
    return `${percent(coupon.value, 0)} off${coupon.maxDiscount ? ` (max ${naira(coupon.maxDiscount)})` : ""}`;
  return `${naira(coupon.value)} off`;
}

export function LifecycleBadge({ lifecycle }: { lifecycle: CouponLifecycle }) {
  return (
    <Badge tone={LIFECYCLE_TONE[lifecycle]} dot>
      {LIFECYCLE_LABEL[lifecycle]}
    </Badge>
  );
}

export function UsageBar({ used, limit }: { used: number; limit: number }) {
  const ratio = limit > 0 ? Math.min(1, used / limit) : 0;
  return (
    <span className="block min-w-[7rem]">
      <span className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-ink">{count(used)}</span>
        <span className="text-ink-faint">of {count(limit)}</span>
      </span>
      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-brand" style={{ width: `${ratio * 100}%` }} />
      </span>
    </span>
  );
}

const meta = (value: ColumnMeta) => value;

export const COUPON_COLUMNS: ColumnDef<Coupon, unknown>[] = [
  {
    id: "code",
    header: "Coupon",
    meta: meta({ sortKey: "code", csv: { key: "code", label: "Code" } }),
    cell: ({ row }) => (
      <span className="block max-w-[18rem]">
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-ink">{row.original.code}</span>
          {row.original.isReward ? (
            <Badge tone="brand">Badge reward</Badge>
          ) : row.original.isGeneral ? (
            <Badge tone="neutral">Everyone</Badge>
          ) : (
            <Badge tone="info">Targeted</Badge>
          )}
        </span>
        <span className="block truncate text-xs text-ink-muted">
          {row.original.name || row.original.description || "—"}
        </span>
      </span>
    ),
  },
  {
    id: "value",
    header: "Discount",
    meta: meta({
      sortKey: "value",
      csv: { key: "value", label: "Discount", value: (row) => discountLabel(row as Coupon) },
    }),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-semibold text-ink">{discountLabel(row.original)}</span>
    ),
  },
  {
    id: "usage",
    header: "Redeemed",
    meta: meta({ sortKey: "usageCount", hideBelow: "md", csv: { key: "usageCount", label: "Redeemed" } }),
    cell: ({ row }) => <UsageBar used={row.original.usageCount} limit={row.original.limit} />,
  },
  {
    id: "discountTotal",
    header: "Discount given",
    meta: meta({ align: "right", hideBelow: "lg", csv: { key: "discountTotal", label: "Discount given (kobo)" } }),
    cell: ({ row }) => (
      <span className="block text-right">
        <span className="block text-sm font-semibold text-ink">{naira(row.original.discountTotal)}</span>
        <span className="block text-[11px] text-ink-muted">
          {count(row.original.uniqueUsers)} customer{row.original.uniqueUsers === 1 ? "" : "s"}
        </span>
      </span>
    ),
  },
  {
    id: "lifecycle",
    header: "Status",
    meta: meta({ csv: { key: "lifecycle", label: "Status" } }),
    cell: ({ row }) => <LifecycleBadge lifecycle={row.original.lifecycle} />,
  },
  {
    id: "expirationDate",
    header: "Expires",
    meta: meta({
      sortKey: "expirationDate",
      align: "right",
      hideBelow: "sm",
      csv: { key: "expirationDate", label: "Expires" },
    }),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-ink-muted">{day(row.original.expirationDate)}</span>
    ),
  },
];

export function CouponMobileCard({ coupon }: { coupon: Coupon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-ink">{coupon.code}</span>
        <LifecycleBadge lifecycle={coupon.lifecycle} />
      </div>
      <p className="text-sm font-semibold text-ink">{discountLabel(coupon)}</p>
      <UsageBar used={coupon.usageCount} limit={coupon.limit} />
      <div className="flex items-center justify-between text-[11px] text-ink-muted">
        <span>{naira(coupon.discountTotal)} given</span>
        <span>Expires {day(coupon.expirationDate)}</span>
      </div>
    </div>
  );
}
