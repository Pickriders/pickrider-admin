import { CouriersTable } from "@/components/CouriersTable";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

const CouriersPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Courier Management" />
        <UI.Button>
          <SVG.PlusIcon />
          Add Driver
        </UI.Button>
      </div>
      <section className="mt-[2rem]">
        <CouriersTable data={Array(10).fill(0)} />
      </section>
    </div>
  );
};
export default CouriersPage;
