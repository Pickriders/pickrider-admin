import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { VerificationPanel } from "./VerificationPanels";
import { RejectModal } from "./RejectModal";

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
        linkPage="Business"
      />

      <div className="mt-9">
        <VerificationPanel />
      </div>

      {/* Modal */}
      <RejectModal />
    </div>
  );
};
export default BusinessVerificationPage;
