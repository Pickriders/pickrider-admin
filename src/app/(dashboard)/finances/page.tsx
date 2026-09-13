import { Suspense } from "react";

import { Skeleton } from "@/components/kit";
import { FinancesClient } from "./finances-client";

/**
 * Finances: platform wallet, payouts, transfers and the transactions ledger.
 * The tab and every table filter live in the URL, so the client half sits
 * under Suspense for Next's static build of `useSearchParams`.
 */
export default function FinancesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <FinancesClient />
    </Suspense>
  );
}
