import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { CouriersTable } from "@/components/CouriersTable";

// export async function generateStaticParams() {
//   return Array(20)
//     .fill(0)
//     .map((_, id) => ({
//       id: `${id}`,
//     }));
// }

const BusinessCourierPage = ({ params }: { params: { id: string } }) => {
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
        currentPage="Courier"
        rootPageLink="/business"
      />
      <div className="mt-10">
        <CouriersTable />
      </div>
    </div>
  );
};
export default BusinessCourierPage;
