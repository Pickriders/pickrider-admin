import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { VerificationPanel } from "./VerificationPanel";
import React from "react";

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
        <VerificationPanel vehicleId={params.id} />
      </div>
    </div>
  );
};
export default VerificationPage;
