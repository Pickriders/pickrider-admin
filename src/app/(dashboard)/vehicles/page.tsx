import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { VechiclesTable } from "@/components/VehiclesTable";

const VehiclesPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Vehicle Management" />
        <UI.Button>
          <SVG.PlusIcon />
          Add Vehicle
        </UI.Button>
      </div>
      <section className="mt-[2.5rem] w-full">
        <VechiclesTable data={Array(7).fill(0)} />
      </section>
    </div>
  );
};
export default VehiclesPage;
