import { UI } from "@/components/ui";
import { DataTable } from "./Table";
import { columns } from "./Table/Columns";

const DataLog = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Data Log"
      />
      <section className="mt-11">
        <DataTable columns={columns} data={Array(5).fill(0)} />
      </section>
    </div>
  );
};
export default DataLog;
