import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { VerificationPanel } from "./VerificationPanel";
import Image from "next/image";
import { X } from "lucide-react";
import { VerificationModalPeview } from "@/components/VerificationModalPreview";
import { Suspense } from "react";

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
        <VerificationModalPeview
          layoutId="verification-modal"
          previewImage="/demo-linc.svg"
        />
      </Suspense>
    </div>
  );
};
export default VerificationPage;
