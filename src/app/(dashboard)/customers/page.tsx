import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { CustomersTable } from "./CustomersTable";
import { DeleteCustomersModal } from "./DeleteCustomersModal";
import { SuspendCustomersModal } from "./SuspendcustomersModal";
import { Suspense } from "react";
import { CustomersTableBulkAction } from "./CustomersTableBulkAction";
import { CustomersTableFilter } from "./CustomersTableFilter";

const Customers = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Customer Management" />
        <UI.Button>
          <SVG.PlusIcon />
          Add Customer
        </UI.Button>
      </div>
      <section className="mt-[2rem] ">
        <div className="bg-background border rounded-lg pb-6 w-full">
          {/* TABLE Query components */}
          <div className="px-[1.4rem] py-5 flex items-center justify-between">
            <CustomersTableBulkAction />
            <div className="flex items-center gap-x-2">
              <Suspense>
                <UI.TableSearchInput />
                <CustomersTableFilter />
              </Suspense>
            </div>
          </div>
          {/* DATA TABLE */}
          <Suspense>
            <CustomersTable />
          </Suspense>
        </div>
      </section>

      {/* Modals */}
      <Suspense>
        <DeleteCustomersModal />
      </Suspense>
      <Suspense>
        <SuspendCustomersModal />
      </Suspense>
    </div>
  );
};
export default Customers;
