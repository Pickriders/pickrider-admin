import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { DetailsForm } from "./DetailsForm";
import { Permissions } from "../../../Permissions";
import { Suspense } from "react";
import { SaveChangesModal } from "./SaveChangesModal";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const DetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/terms-and-permissions", label: "Team & Permissions" },
        ]}
        rootPageLink="/admin"
        currentPage="Nnamani Kester"
      />
      <section className="bg-background flex  items-start rounded-lg px-14 gap-x-6 py-12 mt-11 ">
        <div className="flex-1">
          <Suspense>
            <DetailsForm />
          </Suspense>
        </div>
        <div className="flex-1 ">
          <Permissions />
          <UI.PrimaryButton className="w-[20rem] mt-5" disabled>
            Save
          </UI.PrimaryButton>
        </div>
        {/* Modal */}
        <Suspense>
          <SaveChangesModal />
        </Suspense>
      </section>
    </div>
  );
};

export default DetailsPage;
