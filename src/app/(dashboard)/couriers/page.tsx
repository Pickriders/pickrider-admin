import { Suspense } from "react";
import { CouriersTable } from "@/components/CouriersTable";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

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
      <section className="mt-[2rem] w-full">
        <Suspense>
          <CouriersTable />
        </Suspense>
      </section>
    </div>
  );
};

export default CouriersPage;
