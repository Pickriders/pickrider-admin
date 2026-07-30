"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Coins,
  Landmark,
  Receipt,
  Undo2,
  Wallet,
} from "lucide-react";
import { useGetPlatformWalletQuery } from "@/api/queries";
import { useGetFinanceSummaryQuery } from "@/api/queries/finance";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: "all", label: "All time", days: null },
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "90 days", days: 90 },
] as const;

const toRange = (days: number | null) => {
  if (days === null) return undefined;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(start)},${fmt(end)}`;
};

const HeroCard = ({
  label,
  value,
  icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: "default" | "brand";
  hint?: string;
}) => (
  <div
    className={cn(
      "rounded-2xl border p-5",
      tone === "brand" ? "border-transparent bg-gradient-to-br from-brand to-brand-dark text-white" : "bg-card",
    )}
  >
    <div className="flex items-center justify-between">
      <p className={cn("text-xs font-medium", tone === "brand" ? "text-white/70" : "text-muted-foreground")}>{label}</p>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          tone === "brand" ? "bg-white/15 text-white" : "bg-brand-soft text-brand-dark",
        )}
      >
        {icon}
      </span>
    </div>
    <p className="mt-3 text-2xl font-semibold">{value}</p>
    {hint && <p className={cn("mt-1 text-xs", tone === "brand" ? "text-white/70" : "text-muted-foreground")}>{hint}</p>}
  </div>
);

const BreakdownTile = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className="rounded-2xl border bg-card p-4">
    <span className="grid size-9 place-items-center rounded-xl" style={{ backgroundColor: `${accent}1a`, color: accent }}>
      {icon}
    </span>
    <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export const FinanceOverview = () => {
  const [rangeId, setRangeId] = React.useState<(typeof RANGES)[number]["id"]>("all");
  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[0];

  const { data: wallet } = useGetPlatformWalletQuery();
  const { data: summary } = useGetFinanceSummaryQuery(toRange(range.days));
  const currency = wallet?.currency;
  const money = (v?: number) => formatMoney(subUnitToBaseUnit(v ?? 0), { currency });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Money overview</h2>
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRangeId(r.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                rangeId === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HeroCard
          tone="brand"
          label="Platform balance"
          value={money(wallet?.balance)}
          icon={<Wallet size={17} />}
          hint="Settlement wallet"
        />
        <HeroCard
          label="Total volume processed"
          value={money(summary?.totalVolume)}
          icon={<Coins size={17} />}
          hint={`${(summary?.count ?? 0).toLocaleString()} successful transactions`}
        />
        <HeroCard
          label="Money in (inflow)"
          value={money(summary?.inflow)}
          icon={<ArrowDownLeft size={17} />}
          hint="Credits to wallets"
        />
        <HeroCard
          label="Money out (outflow)"
          value={money(summary?.outflow)}
          icon={<ArrowUpRight size={17} />}
          hint="Debits from wallets"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <BreakdownTile label="Deposits" value={money(summary?.deposits)} icon={<Banknote size={16} />} accent="#32BA7C" />
        <BreakdownTile label="Withdrawals" value={money(summary?.withdrawals)} icon={<Landmark size={16} />} accent="#FF5244" />
        <BreakdownTile label="Fees" value={money(summary?.fees)} icon={<Receipt size={16} />} accent="#F59E0B" />
        <BreakdownTile label="Refunds" value={money(summary?.refunds)} icon={<Undo2 size={16} />} accent="#7C3AED" />
        <BreakdownTile label="Charges" value={money(summary?.charges)} icon={<Coins size={16} />} accent="#2282C8" />
      </div>
    </div>
  );
};
