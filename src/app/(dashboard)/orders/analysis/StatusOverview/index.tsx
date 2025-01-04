import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const StatusOverview = () => {
  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">
        Status Overview
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Completed Orders
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center bg-[#32BA7C] rounded-full">
              <SVG.PackageDelivered />
            </div>
            <span className="font-clash-display font-semibold text-2xl ">
              60
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#32BA7C]" />
            <span className="text-[#32BA7C] font-semibold font-montserrat text-xs">
              + 5.06%
            </span>
          </div>
        </div>
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Canceled Order
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center bg-[#FF5244] rounded-full">
              <SVG.PackageRemove />
            </div>
            <span className="font-clash-display font-semibold text-2xl ">
              60
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#32BA7C]" />
            <span className="text-[#32BA7C] font-semibold font-montserrat text-xs">
              + 5.06%
            </span>
          </div>
        </div>
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Rejected Delivery
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center bg-[#505582] rounded-full">
              <SVG.PackageOutOfStock />
            </div>
            <span className="font-clash-display font-semibold text-2xl ">
              20
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#FF5244]" />
            <span className="text-[#FF5244] font-semibold font-montserrat text-xs">
              - 5.06%
            </span>
          </div>
        </div>
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Missed Pickup
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center bg-[#000] rounded-full">
              <SVG.PackageOpen />
            </div>
            <span className="font-clash-display font-semibold text-2xl ">
              20
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#32BA7C]" />
            <span className="text-[#32BA7C] font-semibold font-montserrat text-xs">
              + 5.06%
            </span>
          </div>
        </div>
      </div>
      <UI.Button variant={"ghost"} className="mt-5" asChild>
        <Link href={"/orders/more-orders"}>
          More details <ChevronRight size={15} />
        </Link>
      </UI.Button>
    </div>
  );
};
