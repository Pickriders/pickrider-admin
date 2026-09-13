"use client";

import { useTabParam } from "@/lib/admin/url-state";
import { PageHeader, Tabs } from "@/components/kit";
import { OverviewTab } from "./overview-tab";
import { PayoutTab } from "./payout-tab";
import { ChargesTab } from "./charges-tab";
import { TransactionsTab } from "./transactions-tab";
import { TransferTab } from "./transfer-tab";

const TABS = ["overview", "charges", "payout", "transfer", "transactions", "withdrawals"] as const;
type Tab = (typeof TABS)[number];

const ITEMS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "charges", label: "Charges" },
  { id: "payout", label: "Payout" },
  { id: "transfer", label: "Transfer to wallet" },
  { id: "transactions", label: "Transactions" },
  { id: "withdrawals", label: "Withdrawals" },
];

export function FinancesClient() {
  const [tab, setTab] = useTabParam<Tab>("overview", TABS);

  return (
    <div>
      <PageHeader title="Finances" description="The platform wallet, what moved through it, and every transaction on the platform." />
      <Tabs value={tab} onChange={setTab} items={ITEMS} className="mb-5" />
      {tab === "overview" ? <OverviewTab /> : null}
      {tab === "charges" ? <ChargesTab /> : null}
      {tab === "payout" ? <PayoutTab /> : null}
      {tab === "transfer" ? <TransferTab /> : null}
      {tab === "transactions" ? <TransactionsTab preset="all" /> : null}
      {tab === "withdrawals" ? <TransactionsTab preset="withdrawals" /> : null}
    </div>
  );
}
