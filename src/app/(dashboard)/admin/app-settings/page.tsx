import { UI } from "@/components/ui";
import { Countries } from "./Countries";

const AppSettings = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="App settings"
      />
      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-foreground">App settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Countries, states, pricing and dispatch configuration.</p>
      </div>
      <section className="mt-6">
        <Countries />
      </section>
    </div>
  );
};
export default AppSettings;
