import { FinanceOverview } from "./FinanceOverview";
import { FinanceOps } from "./FinanceOps";
import { FinanceCharts } from "./FinanceCharts";
import { ExternalPayments } from "./ExternalPayments";
import { TransactionTabs } from "./TransactionTabs";
import { Suspense } from "react";

const FinancesPage = () => {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Finances</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Total volume, cash flow, payouts and every transaction across the platform.
        </p>
      </div>

      <section className="mt-6">
        <Suspense>
          <FinanceOverview />
        </Suspense>
      </section>

      <section className="mt-6">
        <Suspense>
          <FinanceOps />
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
        <Suspense>
          <TransactionTabs />
        </Suspense>
      </section>
    </div>
  );
};

export default FinancesPage;
