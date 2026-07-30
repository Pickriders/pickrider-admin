import { UI } from "@/components/ui";
import { DataTable } from "./Table";
import { Suspense } from "react";

const DataLog = () => {
  return (
    <div>
      <UI.BreadCrumbNav pageLinks={[{ href: "/admin", label: "Admin" }]} rootPageLink="/admin" currentPage="Data Log" />
      <section className="mt-11">
        <Suspense>
          <DataTable />
        </Suspense>
      </section>
    </div>
  );
};
export default DataLog;
