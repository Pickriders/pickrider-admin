import { UI } from "@/components/ui";
import { notFound } from "next/navigation";

import { VechiclesTable } from "@/components/VehiclesTable";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const VehiclesPage = ({ params }: { params: { id: string } }) => {
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
        currentPage="Vehicles"
        rootPageLink="/business"
      />

      <div className="mt-10">
        <VechiclesTable data={Array(13).fill(0)} />
      </div>
    </div>
  );
};

export default VehiclesPage;
