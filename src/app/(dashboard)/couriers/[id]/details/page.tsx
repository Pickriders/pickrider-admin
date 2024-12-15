// "use client";

import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { BusinessBalance } from "./BusinessBalance";
import Link from "next/link";
import { SVG } from "@/components/svg";
import { RidersStats } from "./RiderStats";
import { VehicleStats } from "./vehicleStats";
import dynamic from "next/dynamic";
import { OrdersTable } from "./OrdersTable";
import { RiderMap } from "./RiderMap";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const DetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }
  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Details"
        pageLinks={[{ href: "/couriers", label: "Couriers" }]}
        rootPageLink="/couriers"
      />
      <section className="bg-background rounded-2xl p-10 mt-10">
        <div className="flex items-center justify-between">
          <BusinessBalance />
          <Link
            href={"edit"}
            className="group [&_svg]:dark:stroke-black bg-accent-foreground hover:bg-accent-foreground/80 rounded-lg transition-all duration-500 text-primary-foreground p-3.5 flex items-center gap-x-2"
          >
            <SVG.ShieldUser />{" "}
            <span className="font-montserrat text-xs font-semibold">
              Edit courier details
            </span>
          </Link>
        </div>

        <div className="flex mt-12 gap-x-12">
          <div className="w-[20.8rem]">
            <RidersStats />
            <div className="mt-12">
              <VehicleStats />
            </div>
          </div>
          <div className="flex-1">
            <RiderMap />
            <div className="mt-6">
              <OrdersTable />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default DetailsPage;
