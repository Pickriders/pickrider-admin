import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { StatesList } from "./StatesList";
import { CountryConfig } from "./CountryConfig";

const CountryDetailsPage = ({ params }: { params: { countryId: string } }) => {
  if (!params.countryId) {
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
          <CountryConfig countryId={params.countryId} />

          <StatesList countryId={params.countryId} />
        </div>
      </section>
    </div>
  );
};
export default CountryDetailsPage;
