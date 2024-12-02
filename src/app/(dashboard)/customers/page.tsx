import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { CustomersTableBulkAction } from "./CustomersTableBulkAction";
import { CustomersTableFilter } from "./CustomersTableFilter";
import { CustomersTable } from "./CustomersTable";
import { customersColumns, CustomersProps } from "./CustomersColumn";
import { DeleteCustomersModal } from "./DeleteCustomersModal";
import { SuspendCustomersModal } from "./SuspendcustomersModal";
import { Suspense } from "react";

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
      <section className="mt-[2rem] bg-background rounded-lg pb-6">
        <div className="px-[1.4rem] py-5 flex items-center justify-between">
          <CustomersTableBulkAction />
          <div className="flex items-center gap-x-2">
            <UI.TableSearchInput />
            <CustomersTableFilter />
          </div>
        </div>
        <CustomersTable columns={customersColumns} data={Array(20).fill(0)} />
        <div className="mt-3 flex justify-end px-[1.5rem]">
          <UI.PaginationBtns currentPage={2} totalPages={4} />
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
