import { UI } from "@/components/ui";
import { DataTable } from "./Table";
import { columns } from "./Table/Column";

const TermsAndPermissionsPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Team & Permissions"
      />

      <section className="mt-11">
        <DataTable columns={columns} data={Array(10).fill(0)} />
      </section>
    </div>
  );
};
export default TermsAndPermissionsPage;
