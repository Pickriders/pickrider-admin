import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { VerificationPanel } from "./VerificationPanels";
import { Suspense } from "react";
import { RejectVerificationModal } from "@/components/RejectVerificationModal";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const BusinessVerificationPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Verification"
        rootPageLink="/business"
        pageLinks={[{ href: "/business", label: "Business" }]}
      />

      <div className="mt-14">
        <VerificationPanel />
      </div>

      {/* Modal */}
      <Suspense>
        <RejectVerificationModal />
      </Suspense>
    </div>
  );
};
export default BusinessVerificationPage;
