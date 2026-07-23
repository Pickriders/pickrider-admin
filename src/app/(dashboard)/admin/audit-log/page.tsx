import { UI } from "@/components/ui";
import { Suspense } from "react";
import { AuditTable } from "./AuditTable";

const AuditLogPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav pageLinks={[{ href: "/admin", label: "Admin" }]} rootPageLink="/admin" currentPage="Audit Log" />
      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-foreground">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every admin and system action across the platform, most recent first.
        </p>
      </div>
      <section className="mt-6">
        <Suspense>
          <AuditTable />
        </Suspense>
      </section>
    </div>
  );
};
export default AuditLogPage;
