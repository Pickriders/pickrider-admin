import { Suspense } from "react";
import { SettingsNavigation } from "./SettingsNavigation";
import { AdminStats } from "./AdminStats";

const AdminPage = () => {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform configuration, team management and system logs.</p>
      </div>

      <section className="mt-6">
        <Suspense>
          <AdminStats />
        </Suspense>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tools</h2>
        <SettingsNavigation />
      </section>
    </div>
  );
};
export default AdminPage;
