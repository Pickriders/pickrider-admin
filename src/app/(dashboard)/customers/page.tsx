import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

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
          <UI.TableBulkAction />
          <div className="flex items-center gap-x-2">
            <UI.TableSearchInput />
            <UI.TableFilter />
          </div>
        </div>
      </section>
    </div>
  );
};
export default Customers;
