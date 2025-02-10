import { UI } from "@/components/ui";

const AddState = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
          { href: "/admin/app-settings/add-country", label: "Add country" },
        ]}
        rootPageLink="/admin"
        currentPage="Add State"
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
        <form action="/add-country">
          <UI.PrimaryHeading text="Add State" />
          <div className="mt-8 flex items-center gap-x-4">
            <UI.Input
              labelValue="State name"
              id="State name"
              className="w-[21rem]"
            />
            <UI.Input labelValue="Code" id="Code" className="w-[21rem]" />
          </div>
          <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Input
              labelValue="Base fuel price"
              id="Base fuel price"
              type="number"
              className="w-[21rem]"
            />
            <UI.Input
              labelValue="Current fuel price"
              id="Current fuel price"
              className="w-[21rem]"
              type="number"
              leftIcon={<UI.Button variant={"ghost"}>N</UI.Button>}
            />
            <UI.Input
              labelValue="Price per km"
              id="Price per km"
              className="w-[21rem]"
              type="number"
              leftIcon={<UI.Button variant={"ghost"}>N</UI.Button>}
            />
            <UI.Input
              labelValue="Searchable distance (km)"
              id="Searchable distance (km)"
              className="w-[21rem]"
              type="number"
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
export default AddState;
