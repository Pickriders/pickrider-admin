import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { DetailsForm } from "./DetailsForm";
import { Permissions } from "../../../Permissions";
import { Suspense } from "react";
import { SaveChangesModal } from "./SaveChangesModal";

const DetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/teams-and-permissions", label: "Team & Permissions" },
        ]}
        rootPageLink="/admin"
        currentPage="Team member"
      />
      <section className="bg-background flex flex-col lg:flex-row items-start rounded-lg px-5 sm:px-8 lg:px-14 gap-8 lg:gap-x-6 py-8 sm:py-12 mt-8 sm:mt-11 ">
        <div className="flex-1 min-w-0 w-full">
          <Suspense>
            <DetailsForm userId={params.id} />
          </Suspense>
        </div>
        <div className="flex-1 min-w-0 w-full ">
          <Permissions />
          <UI.PrimaryButton className="w-full sm:w-[20rem] mt-5" disabled>
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
