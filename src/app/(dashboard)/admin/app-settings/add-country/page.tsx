import { UI } from "@/components/ui";
import { CountryForm } from "./CountryForm";

const AddCountry = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
        ]}
        rootPageLink="/admin"
        currentPage="Add Country"
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
        <CountryForm />
      </section>
    </div>
  );
};
export default AddCountry;
