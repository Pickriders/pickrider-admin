import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { BusinessTable } from "./BusinessTable";
import { businessTableColumn } from "./BusinessTableColumn";
import { DeleteBusinessModal } from "./DeleteBusinessModal";
import { SuspendBusinessModal } from "./SuspendBusinessModal";

const BusinessPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Business Management" />
        <UI.Button>
          <SVG.PlusIcon />
          Add Business
        </UI.Button>
      </div>

      <section className="mt-[2rem]">
        <BusinessTable columns={businessTableColumn} data={Array(20).fill(0)} />
      </section>

      {/* Modals */}
      <DeleteBusinessModal />
      <SuspendBusinessModal />
    </div>
  );
};
export default BusinessPage;
