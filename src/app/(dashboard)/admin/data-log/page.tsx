import { UI } from "@/components/ui";
import { DataTable } from "./Table";
import { columns } from "./Table/Columns";
import { Suspense } from "react";

const DataLog = () => {
  return (
    <div>
      <UI.BreadCrumbNav pageLinks={[{ href: "/admin", label: "Admin" }]} rootPageLink="/admin" currentPage="Data Log" />
      <section className="mt-11">
        <Suspense>
          <DataTable columns={columns} data={Array(5).fill(0)} />
        </Suspense>
      </section>
    </div>
  );
};
export default DataLog;
