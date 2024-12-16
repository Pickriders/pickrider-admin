import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { VerificationPanel } from "./VerificationPanel";
import { RejectVerificationModal } from "@/components/RejectVerificationModal";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const VerificationPage = ({ params }: { params: { id: string } }) => {
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
        <VerificationPanel />
      </div>

      {/* Preview */}
      <Suspense>
        <RejectVerificationModal />
      </Suspense>
    </div>
  );
};
export default VerificationPage;
