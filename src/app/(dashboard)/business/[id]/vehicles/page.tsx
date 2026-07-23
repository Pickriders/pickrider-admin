import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { BusinessVehiclesTable } from "./BusinessVehiclesTable";

const VehiclesPage = ({ params }: { params: { id: string } }) => {
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
        currentPage="Vehicles"
        rootPageLink="/business"
      />

      <div className="mt-10">
        <Suspense>
          <BusinessVehiclesTable businessId={params.id} />
        </Suspense>
      </div>
    </div>
  );
};

export default VehiclesPage;
