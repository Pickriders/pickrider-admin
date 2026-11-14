import { Suspense } from "react";

import { PageHeader, SkeletonLine, TabsSkeleton } from "@/components/kit";

import { OrdersView } from "./_components/orders-view";

/** Until the search params resolve: the real title, the description line and the four tabs. */
function OrdersFallback() {
  return (
    <div aria-busy="true">
      <PageHeader title="Orders" description={<SkeletonLine box="h-5" bar="h-3.5 w-80 max-w-full" />} />
      <TabsSkeleton widths={["w-[4.5rem]", "w-24", "w-24", "w-[5.5rem]"]} className="mb-4" />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersView />
    </Suspense>
  );
}
