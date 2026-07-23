import { UI } from "@/components/ui";
import { Suspense } from "react";
import { DataTable } from "./Table";

const TermsAndPermissionsPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Team & Permissions"
      />

      <section className="mt-11">
        <Suspense>
          <DataTable />
        </Suspense>
      </section>
    </div>
  );
};
export default TermsAndPermissionsPage;
