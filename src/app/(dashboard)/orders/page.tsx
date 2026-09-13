import { Suspense } from "react";

import { OrdersView } from "./_components/orders-view";

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
