import { notFound } from "next/navigation";
import { Suspense } from "react";

import { OrderDetail } from "./_components/order-detail";

export default function OrderPage({ params }: { params: { id: string } }) {
  if (!params.id) notFound();
  return (
    <Suspense>
      <OrderDetail orderId={params.id} />
    </Suspense>
  );
}
