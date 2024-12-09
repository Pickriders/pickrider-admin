import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SuspendCourierModal } from "./SuspendModal";
import { DeleteCourierModal } from "./DeleteModal";
import { CouriersTable } from "@/components/CouriersTable";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const BusinessCourierPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/business", label: "Business" },
          { href: "business-details", label: "Peterson Corp" },
        ]}
        currentPage="Courier"
        rootPageLink="/business"
      />
      <div className="mt-10">
        <CouriersTable data={Array(13).fill(0)} />
      </div>

      {/* Modals */}
      <Suspense>
        <SuspendCourierModal />
        <DeleteCourierModal />
      </Suspense>
    </div>
  );
};
export default BusinessCourierPage;
