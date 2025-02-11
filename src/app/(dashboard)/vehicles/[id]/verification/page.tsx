import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { VerificationPanel } from "./VerificationPanel";
import React, { Suspense } from "react";

interface VehicleVerificationPageProps {
  params: { id: string };
}

const VerificationPage: React.FC<VehicleVerificationPageProps> = ({ params }) => {
  if (!params.id) {
    notFound();
  }
  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Verification"
        rootPageLink="/vehicles"
        pageLinks={[{ href: "/vehicles", label: "Vehicles" }]}
      />
      <div className="mt-16">
        <Suspense>
          <VerificationPanel vehicleId={params.id} />
        </Suspense>
      </div>
    </div>
  );
};
export default VerificationPage;
