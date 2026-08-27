import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { ProfilePic } from "./ProfilePic";

const EditBusinessDetails = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/business", label: "Business" },
          { href: "business-details", label: "Peterson Corp" },
        ]}
        currentPage="Edit Details"
        rootPageLink="/business"
      />
      <section className="bg-background rounded-2xl p-5 sm:p-10 mt-8 sm:mt-10">
        <form>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-x-8 items-start">
            <div className="">
              <ProfilePic />
            </div>
            <div className="flex-1 min-w-0 w-full space-y-4 ">
              <UI.Input
                id="bus-name"
                labelClassName="font-montserrat"
                labelValue="Business Name"
              />
              <UI.Input
                id="bus-reg"
                labelClassName="font-montserrat"
                labelValue="Business Registration Number"
              />
              <UI.Input
                id="bus-fullname"
                labelClassName="font-montserrat"
                labelValue="Registrar Full Name"
              />
              <UI.Input
                id="bus-address"
                labelClassName="font-montserrat"
                labelValue="Business Address"
              />
            </div>
          </div>

          <div className="mt-20">
            <UI.PrimaryButton>Submit</UI.PrimaryButton>
          </div>
        </form>
      </section>
    </div>
  );
};
export default EditBusinessDetails;
