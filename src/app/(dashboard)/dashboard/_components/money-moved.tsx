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
      <div className="grid grid-cols-1 gap-6 p-6 pt-4 lg:grid-cols-2">
        <div className="grid grid-cols-3 gap-3">
          {flows.map((flow) => {
            const Icon = flow.icon;
            return (
              <div key={flow.label} className="min-w-0 rounded-2xl bg-surface p-4">
                <span className={cx("inline-grid h-8 w-8 place-items-center rounded-lg", flow.chip)}>
                  <Icon size={15} />
                </span>
                <p className={cx("mt-3 truncate text-xl font-black leading-none tracking-tight tabular-nums", flow.tone)} title={naira(flow.value)}>
                  {loading ? <Skeleton className="h-6 w-16" /> : nairaCompact(flow.value)}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-ink-muted">{flow.label}</p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {balances.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cx("min-w-0 rounded-2xl border p-4 transition-colors", item.dark ? "border-transparent bg-ink text-card hover:opacity-95 dark:border-brand/40 dark:bg-brand-soft dark:text-ink dark:hover:opacity-100 dark:hover:bg-brand-soft/80" : "border-line hover:bg-surface")}
              >
                <span className={cx("inline-grid h-8 w-8 place-items-center rounded-lg", item.dark ? "bg-card/15 text-card dark:bg-brand/20 dark:text-brand" : "bg-brand-soft text-brand-dark")}>
                  <Icon size={15} />
                </span>
                <p className={cx("mt-3 truncate text-xl font-black leading-none tracking-tight tabular-nums", item.dark ? "text-card dark:text-ink" : "text-ink")} title={naira(item.value)}>
                  {loading ? <Skeleton className={cx("h-6 w-16", item.dark && "bg-card/20 dark:bg-brand/20")} /> : nairaCompact(item.value)}
                </p>
                <p className={cx("mt-1.5 text-xs font-semibold", item.dark ? "text-card/70 dark:text-ink-muted" : "text-ink-muted")}>{item.label}</p>
                <p className={cx("text-[11px]", item.dark ? "text-card/50 dark:text-ink-faint" : "text-ink-faint")}>{item.hint}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
