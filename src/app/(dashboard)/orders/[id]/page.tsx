import { notFound } from "next/navigation";
import { Suspense } from "react";
import OrderDetailsPage from "./OrderDetailsPage";

const OrderPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <Suspense>
        <OrderDetailsPage orderId={params.id} />
      </Suspense>
    </div>
  );
};

export default OrderPage;
