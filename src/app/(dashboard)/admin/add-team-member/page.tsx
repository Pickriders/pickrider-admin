import { UI } from "@/components/ui";
import { Details } from "./Details";
import { Permissions } from "../Permissions";

const AddTeamMemberPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Add Team Member"
      />

      <section className="bg-background rounded-lg px-14 py-12 mt-11 ">
        <div className="flex  items-start">
          <div className="flex-1">
            <Details />
          </div>
          <div className="flex-1">
            <Permissions />
          </div>
        </div>
        <UI.PrimaryButton disabled className="mt-5">
          Add
        </UI.PrimaryButton>
      </section>
    </div>
  );
};
export default AddTeamMemberPage;
