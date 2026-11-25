import { Suspense } from "react";

import { OrdersFallback } from "./_components/orders-fallback";
import { OrdersView } from "./_components/orders-view";

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback title="Orders" />}>
      <OrdersView />
    </Suspense>
  );
}
