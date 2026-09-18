"use client";

import { useTabParam } from "@/lib/admin/url-state";
import { PageHeader, Tabs } from "@/components/kit";
import { OverviewTab } from "./overview-tab";
import { PayoutTab } from "./payout-tab";
import { ChargesTab } from "./charges-tab";
import { TransactionsTab } from "./transactions-tab";
import { TransferTab } from "./transfer-tab";
import { useCan } from "@/lib/admin/use-can";

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
  const { can } = useCan();
  // Moving the platform's own money is owner + finance only; everyone else with finance access reads.
  const treasury = can("finance.treasury");
  const items = ITEMS.filter((item) => treasury || (item.id !== "payout" && item.id !== "transfer"));
  const active = items.some((item) => item.id === tab) ? tab : "overview";

  return (
    <div>
      <PageHeader title="Finances" description="The platform wallet, what moved through it, and every transaction on the platform." />
      <Tabs value={active} onChange={setTab} items={items} className="mb-5" />
      {active === "overview" ? <OverviewTab /> : null}
      {active === "charges" ? <ChargesTab /> : null}
      {active === "payout" && treasury ? <PayoutTab /> : null}
      {active === "transfer" && treasury ? <TransferTab /> : null}
      {active === "transactions" ? <TransactionsTab preset="all" /> : null}
      {active === "withdrawals" ? <TransactionsTab preset="withdrawals" /> : null}
    </div>
  );
}
