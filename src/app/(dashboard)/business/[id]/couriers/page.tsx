import { Suspense } from "react";
import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { CouriersTable } from "@/components/CouriersTable";

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
        <Suspense>
          <CouriersTable />
        </Suspense>
      </div>
    </div>
  );
};
export default BusinessCourierPage;
