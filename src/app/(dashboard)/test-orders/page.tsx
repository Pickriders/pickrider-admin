import { Suspense } from "react";

import { OrdersFallback } from "../orders/_components/orders-fallback";
import { OrdersView } from "../orders/_components/orders-view";

/** Developer API test orders, kept off the Orders page: the same board, scheduled, list and analysis tabs. */
export default function TestOrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback title="Test orders" />}>
      <OrdersView mode="test" />
    </Suspense>
  );
}
