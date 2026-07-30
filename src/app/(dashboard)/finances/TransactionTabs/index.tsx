"use client";

import * as React from "react";
import { HistoryTable } from "../HistoryTable";
import { WithdrawalsTable } from "../WithdrawalsTable";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "transactions", label: "Transactions" },
  { id: "withdrawals", label: "Withdrawals" },
] as const;

export const TransactionTabs = () => {
  const [tab, setTab] = React.useState<(typeof TABS)[number]["id"]>("transactions");

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Transaction history</h2>
        <div className="flex items-center gap-1 rounded-xl border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">{tab === "transactions" ? <HistoryTable /> : <WithdrawalsTable />}</div>
    </div>
  );
};
