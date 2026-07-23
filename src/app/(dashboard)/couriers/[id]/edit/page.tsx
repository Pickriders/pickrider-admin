import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { RiderProfilePic } from "./RiderProfilePic";
import { DetailsForm } from "./DetailsForm";

const EditPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }
  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Edit Details"
        pageLinks={[
          { href: "/couriers", label: "Couriers" },
          { href: "details", label: "Details" },
        ]}
        rootPageLink="/couriers"
      />
      <section className="bg-background rounded-2xl p-16 mt-10">
        <div className="flex items-start gap-x-12">
          <div>
            <RiderProfilePic />
          </div>
          <div className="flex-1 ">
            <DetailsForm />
          </div>
        </div>
      </section>
    </div>
  );
};
export default EditPage;
