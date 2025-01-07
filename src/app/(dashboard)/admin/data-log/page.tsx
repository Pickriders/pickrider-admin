import { UI } from "@/components/ui";
import { DataTable } from "./Table";

const DataLog = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Data Log"
      />
      <section className="mt-11">
        <DataTable />
      </section>
    </div>
  );
};
export default DataLog;
