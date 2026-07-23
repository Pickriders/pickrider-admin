import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { FinanceOverview } from "./FinanceOverview";
import { FinanceCharts } from "./FinanceCharts";
import { ExternalPayments } from "./ExternalPayments";
import { HistoryTable } from "./HistoryTable";
import Link from "next/link";
import { Suspense } from "react";

const FinancesPage = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Finances</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Total volume, cash flow and every transaction across the platform.
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <UI.Button variant="outline" asChild>
            <Link href={"/finances/withdraw"} className="flex items-center gap-2">
              Withdraw
              <SVG.DownLoad />
            </Link>
          </UI.Button>
          <UI.Button asChild>
            <Link href={"/finances/initiate-payout"} className="flex items-center gap-2">
              Initiate Payout
              <SVG.MoneySend />
            </Link>
          </UI.Button>
        </div>
      </div>

      <section className="mt-6">
        <Suspense>
          <FinanceOverview />
        </Suspense>
      </section>

      <Suspense>
        <FinanceCharts />
      </Suspense>

      <section className="mt-6">
        <Suspense>
          <ExternalPayments />
        </Suspense>
      </section>

      <section className="mt-6 w-full rounded-2xl border bg-card p-6">
        <div className="mb-2">
          <UI.SectionHeader text="Transaction history" />
        </div>
        <Suspense>
          <HistoryTable />
        </Suspense>
      </section>
    </div>
  );
};

export default FinancesPage;
