import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { BusinessOrdersTable } from "./BusinessOrdersTable";

const OrdersPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/business", label: "Business" },
          { href: "business-details", label: "Business details" },
        ]}
        currentPage="Orders"
        rootPageLink="/business"
      />
      <section className="mt-10">
        <Suspense>
          <BusinessOrdersTable businessId={params.id} />
        </Suspense>
      </section>
    </div>
  );
};
export default OrdersPage;
