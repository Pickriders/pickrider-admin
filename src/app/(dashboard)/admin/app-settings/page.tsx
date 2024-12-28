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
      <section className="mt-12 bg-background rounded-2xl p-6">
        <Countries />
      </section>
    </div>
  );
};
export default AppSettings;
