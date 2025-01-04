import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const StateDetails = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
          { href: "country-details", label: "Country details" },
        ]}
        rootPageLink="/admin"
        currentPage="State Details"
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
        <form action="/add-country">
          <UI.PrimaryHeading text="State Details" />
          <div className="mt-8 flex items-center gap-x-4">
            <UI.Input
              labelValue="State name"
              id="State name"
              className="w-[21rem]"
              defaultValue={"Enugu"}
            />
            <UI.Input
              defaultValue={"EN"}
              labelValue="Code"
              id="Code"
              className="w-[21rem]"
            />
          </div>
          <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Input
              defaultValue={"1,120"}
              labelValue="Base fuel price"
              id="Base fuel price"
              type="number"
              className="w-[21rem]"
            />
            <UI.Input
              labelValue="Current fuel price"
              id="Current fuel price"
              className="w-[21rem]"
              defaultValue={"1,150"}
              type="number"
              leftIcon={<UI.Button variant={"ghost"}>N</UI.Button>}
            />
            <UI.Input
              labelValue="Price per km"
              id="Price per km"
              className="w-[21rem]"
              defaultValue={"1,700"}
              type="number"
              leftIcon={<UI.Button variant={"ghost"}>N</UI.Button>}
            />
            <UI.Input
              labelValue="Searchable distance (km)"
              id="Searchable distance (km)"
              className="w-[21rem]"
              type="number"
              defaultValue={"100"}
            />
          </div>
          <div className="mt-12 flex items-center gap-x-4">
            <UI.PrimaryButton
              type="button"
              variant="outline"
              className="w-[10rem]"
            >
              Back
            </UI.PrimaryButton>
            <UI.PrimaryButton className="w-[10rem]">Save</UI.PrimaryButton>
          </div>
        </form>
      </section>
    </div>
  );
};
export default StateDetails;
