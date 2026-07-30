import { UI } from "@/components/ui";
import { BusinessTable } from "./BusinessTable";
import { DeleteBusinessModal } from "./DeleteBusinessModal";
import { SuspendBusinessModal } from "./SuspendBusinessModal";
import { Suspense } from "react";

const BusinessPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Business Management" />
      </div>

      <section className="mt-[2rem]">
        <Suspense>
          <BusinessTable />
        </Suspense>
      </section>

      {/* Modals */}
      <Suspense>
        <DeleteBusinessModal />
        <SuspendBusinessModal />
      </Suspense>
    </div>
  );
};
export default BusinessPage;
