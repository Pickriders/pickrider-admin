"use client";

import Link from "next/link";
import { Car, CheckCircle2, Clock, FileBadge, MessageSquareWarning, PauseCircle, Receipt, UserX, type LucideIcon } from "lucide-react";

import { useAttention } from "@/lib/admin/hooks";
import { count } from "@/lib/admin/format";
import { Skeleton, cx, type Tone } from "@/components/kit/primitives";

/**
 * One quiet row of chips for the things waiting on a person. Each chip links
 * straight to the page and filter that clears it; chips at zero are hidden.
 */
type Item = { key: string; n: number; label: string; href: string; tone: Tone; icon: LucideIcon };

const CHIP: Record<Tone, string> = {
  neutral: "border-line bg-card text-ink hover:bg-surface",
  brand: "border-brand/30 bg-brand-soft text-brand-dark hover:border-brand/60",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning hover:border-warning/60",
  danger: "border-danger/30 bg-danger-soft text-danger hover:border-danger/60",
  info: "border-info/30 bg-info-soft text-info hover:border-info/60",
};

export function AttentionStrip() {
  const attention = useAttention();
  const data = attention.data;
  const loading = attention.isLoading && !data;

  const items: Item[] = data
    ? ([
        { key: "stale", n: data.ordersAwaitingRiderStale, label: "orders waiting too long", href: "/orders?status=INITIATED", tone: "danger", icon: Clock },
        { key: "licences", n: data.licencesAwaitingReview, label: "licences to review", href: "/couriers?driversLicenseVerified=SUBMITTED", tone: "brand", icon: FileBadge },
        { key: "vehicles", n: data.vehiclesPendingVerification, label: "vehicles to verify", href: "/vehicles?status=PENDING", tone: "brand", icon: Car },
        { key: "withdrawals", n: data.withdrawalsProcessing, label: "withdrawals processing", href: "/finances?tab=transactions&category=WITHDRAWAL&status=PROCESSING", tone: "warning", icon: Receipt },
        { key: "failed-tx", n: data.failedTransactions24h, label: "failed transactions, 24h", href: "/finances?tab=transactions&status=FAILED", tone: "danger", icon: Receipt },
        { key: "failed-notif", n: data.failedNotifications24h, label: "failed messages, 24h", href: "/messaging?tab=log&status=FAILED", tone: "warning", icon: MessageSquareWarning },
        { key: "suspended", n: data.suspendedRiders, label: "riders suspended", href: "/couriers?status=SUSPENDED", tone: "neutral", icon: UserX },
        { key: "paused", n: data.ridersPausedFromDispatch, label: "riders paused", href: "/couriers?dispatchPaused=true", tone: "neutral", icon: PauseCircle },
      ] satisfies Item[]).filter((item) => item.n > 0)
    : [];

  if (loading) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-9 w-40 rounded-full" />
        <Skeleton className="h-9 w-44 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>
    );
  }

  return (
    <div className="admin-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <span className="shrink-0 self-center pr-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">Needs attention</span>
      {!items.length ? (
        <span className={cx("inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold", CHIP.success)}>
          <CheckCircle2 size={14} /> All clear
        </span>
      ) : (
        items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.href} className={cx("inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors", CHIP[item.tone])}>
              <Icon size={14} />
              <span className="text-sm font-black tabular-nums">{count(item.n)}</span>
              <span>{item.label}</span>
            </Link>
          );
        })
      )}
    </div>
  );
}
