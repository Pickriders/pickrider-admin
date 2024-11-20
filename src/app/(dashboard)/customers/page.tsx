import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
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
      <section className="mt-[2rem] bg-background rounded-2xl">
        <div className="px-[1.4rem] py-5 flex items-center justify-between">
          <CustomersTableBulkAction />
          <div className="flex items-center gap-x-2">
            <UI.TableSearchInput />
            <CustomersTableFilter />
          </div>
        </div>
      </section>
    </div>
  );
};
export default Customers;
