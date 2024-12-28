import { UI } from "@/components/ui";

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
        <UI.PrimaryHeading text="Configuration" />
        <div className="mt-8">
          <div className="flex items-center gap-x-8">
            <UI.Input
              labelValue="Country name"
              id="Country name"
              className="w-[21rem]"
            />
            <UI.Input labelValue="Code" id="Code" className="w-[21rem]" />
          </div>
          <div className="flex items-center mt-6 gap-x-8">
            <UI.Input
              labelValue="Currency name"
              id="Currency name"
              className="w-[21rem]"
            />
            <UI.Input
              labelValue="Currency symbol"
              id="Currency symbol"
              className="w-[21rem]"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
export default AddCountry;
