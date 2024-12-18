import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { VerificationPanel } from "./VerificationPanel";

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
        rootPageLink="/vehicles"
        pageLinks={[{ href: "/vehicles", label: "Vehicles" }]}
      />
      <div className="mt-16">
        <VerificationPanel />
      </div>
    </div>
  );
};
export default VerificationPage;
