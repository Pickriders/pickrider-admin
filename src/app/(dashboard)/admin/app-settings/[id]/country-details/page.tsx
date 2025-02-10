import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { States } from "./States";
import { CountryConfig } from "./CountryConfig";

const CountryDetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
        ]}
        rootPageLink="/admin"
        currentPage="Country Details"
      />
      <section className="mt-12 bg-background rounded-2xl p-6">
        <div>
          <UI.PrimaryHeading text="Country Details" />
          <CountryConfig countryId={params.id} />

          <States countryId={params.id} />
        </div>
      </section>
    </div>
  );
};
export default CountryDetailsPage;
