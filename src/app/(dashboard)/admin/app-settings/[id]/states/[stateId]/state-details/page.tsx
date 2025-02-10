import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { StateConfig } from "./StateConfig";

const StateDetails = ({ params }: { params: { id: string; stateId: string } }) => {
  if (!params.id || !params.stateId) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
          { href: `/admin/app-settings/${params.id}/country-details`, label: "Country details" },
        ]}
        rootPageLink="/admin"
        currentPage="State Details"
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
        <StateConfig countryId={params.id} stateId={params.stateId} />
      </section>
    </div>
  );
};
export default StateDetails;
