"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Building2, Landmark, Scale, Users, type LucideIcon } from "lucide-react";

import type { Overview } from "@/lib/admin/api";
import { count, naira, nairaCompact } from "@/lib/admin/format";
import { Panel, PanelHeader, Skeleton, cx } from "@/components/kit/primitives";

/**
 * Money in, money out and the net for the window, then where balances sit
 * right now. The full split by category lives on the Finances page.
 */
export function MoneyMoved({
  transactions,
  wallets,
  loading,
  windowLabel,
}: {
  transactions?: Overview["transactions"];
  wallets?: Overview["wallets"];
  loading: boolean;
  windowLabel: string;
}) {
  const moneyIn = transactions?.moneyIn ?? 0;
  const moneyOut = transactions?.moneyOut ?? 0;
  const net = moneyIn - moneyOut;
  const flows: { label: string; value: number; icon: LucideIcon; tone: string; chip: string }[] = [
    { label: "Money in", value: moneyIn, icon: ArrowDownLeft, tone: "text-success", chip: "bg-success-soft text-success" },
    { label: "Money out", value: moneyOut, icon: ArrowUpRight, tone: "text-danger", chip: "bg-danger-soft text-danger" },
    { label: "Net", value: net, icon: Scale, tone: net >= 0 ? "text-ink" : "text-danger", chip: "bg-surface text-ink-muted" },
  ];
  const balances: { label: string; value?: number; hint: string; icon: LucideIcon; href: string; dark?: boolean }[] = [
    { label: "Platform wallet", value: wallets?.platformBalance, hint: "Settlement balance", icon: Landmark, href: "/finances", dark: true },
    { label: "User wallets", value: wallets?.userBalances, hint: `${count(wallets?.userWallets)} wallets`, icon: Users, href: "/customers" },
    { label: "Business wallets", value: wallets?.businessBalances, hint: `${count(wallets?.businessWallets)} wallets`, icon: Building2, href: "/business" },
  ];

  return (
    <Panel>
      <PanelHeader
        title="Money"
        subtitle={`${count(transactions?.count)} successful transactions, ${windowLabel}`}
        action={
          <Link href="/finances" className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
            Finances <ArrowRight size={13} />
          </Link>
        }
      />
      <div className="space-y-5 p-5 pt-4 sm:p-6 sm:pt-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Moved, {windowLabel}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {flows.map((flow) => {
              const Icon = flow.icon;
              return (
                <div key={flow.label} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 sm:block">
                  <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", flow.chip)}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 sm:mt-4 sm:block">
                    <span className={cx("block truncate text-xl font-black leading-none tracking-tight tabular-nums sm:text-2xl", flow.tone)} title={naira(flow.value)}>
                      {loading ? <Skeleton className="h-6 w-16" /> : nairaCompact(flow.value)}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-ink-muted sm:mt-1.5">{flow.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Sitting in wallets now</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {balances.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cx(
                    "flex items-center gap-3 rounded-2xl border p-4 transition-colors sm:block",
                    item.dark ? "border-brand/40 bg-brand-soft hover:bg-brand-soft/80" : "border-line bg-card hover:bg-surface",
                  )}
                >
                  <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", item.dark ? "bg-brand text-brand-ink" : "bg-brand-soft text-brand-dark")}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 sm:mt-4 sm:block">
                    <span className="block truncate text-xl font-black leading-none tracking-tight tabular-nums text-ink sm:text-2xl" title={naira(item.value)}>
                      {loading ? <Skeleton className={cx("h-6 w-16", item.dark && "bg-brand/20")} /> : nairaCompact(item.value)}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-ink-muted sm:mt-1.5">{item.label}</span>
                    <span className="block text-[11px] text-ink-faint">{item.hint}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
