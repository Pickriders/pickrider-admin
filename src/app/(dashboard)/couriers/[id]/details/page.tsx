"use client";

import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { BusinessBalance } from "./BusinessBalance";
import Link from "next/link";
import { SVG } from "@/components/svg";

import { RidersStats } from "./RiderStats";
import { VehicleStats } from "./vehicleStats";
import { OrdersTable } from "./OrdersTable";
import { RiderMap } from "./RiderMap";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useGetUserDetailsQuery } from "@/api";

const DetailsPage = ({ params }: { params: { id: string } }) => {
  const { data } = useGetUserDetailsQuery(params.id);

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
        {!data ? (
          <div className="h-[25rem] grid place-items-center">
            <LoaderCircle size={40} className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <BusinessBalance email={data.email} firstname={data.firstname} lastname={data.lastname} />
              <div className="flex items-center gap-x-3">
                <Link
                  href={"verification"}
                  className="group [&_svg]:dark:stroke-black bg-accent-foreground hover:bg-accent-foreground/80 rounded-lg transition-all duration-500 text-primary-foreground p-3.5 flex items-center gap-x-2"
                >
                  <ShieldCheck />
                  <span className="font-montserrat text-xs font-semibold">Couriers Verification</span>
                </Link>
                <Link
                  href={"edit"}
                  className="group [&_svg]:dark:stroke-black bg-accent-foreground hover:bg-accent-foreground/80 rounded-lg transition-all duration-500 text-primary-foreground p-3.5 flex items-center gap-x-2"
                >
                  <SVG.ShieldUser /> <span className="font-montserrat text-xs font-semibold">Edit courier details</span>
                </Link>
              </div>
            </div>

            <div className="flex mt-12 gap-x-12">
              <div className="w-[20.8rem]">
                <RidersStats phoneNumber={data.phone} />
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
          </>
        )}
      </section>
    </div>
  );
};
export default DetailsPage;
