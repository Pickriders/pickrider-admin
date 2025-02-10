import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { VerificationPanel } from "./VerificationPanel";
import { RejectVerificationModal } from "@/components/RejectVerificationModal";

const VerificationPage = ({ params }: { params: { id: string } }) => {
  // console.log(data);

  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Verification"
        rootPageLink="/couriers"
        pageLinks={[{ href: "/couriers", label: "Couriers" }]}
      />

      <div className="mt-16">
        <VerificationPanel userId={params.id} />
      </div>

      {/* Preview */}
      <Suspense>
        <RejectVerificationModal />
      </Suspense>
    </div>
  );
};
export default VerificationPage;
