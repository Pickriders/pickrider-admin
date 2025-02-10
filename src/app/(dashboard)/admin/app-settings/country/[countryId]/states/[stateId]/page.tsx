import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { StateConfig } from "./StateConfig";

const StateDetails = ({ params }: { params: { countryId: string; stateId: string } }) => {
  console.log({ params });
  if (!params.countryId || !params.stateId) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
          { href: `/admin/app-settings/country/${params.countryId}`, label: "Country details" },
        ]}
        rootPageLink="/admin"
        currentPage="State Details"
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
        <StateConfig countryId={params.countryId} stateId={params.stateId} />
      </section>
    </div>
  );
};
export default StateDetails;
