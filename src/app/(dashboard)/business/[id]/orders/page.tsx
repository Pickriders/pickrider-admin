import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { DeleteOrdersModal } from "./DeleteModal";
import { OrdersTable } from "@/components/OrdersTable";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const OrdersPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/business", label: "Business" },
          { href: "business-details", label: "Peterson Corp" },
        ]}
        currentPage="Orders"
        rootPageLink="/business"
      />
      <section className="mt-10">
        <OrdersTable data={Array(20).fill(0)} />
      </section>

      {/* Modal */}
      <Suspense>
        <DeleteOrdersModal />
      </Suspense>
    </div>
  );
};
export default OrdersPage;
