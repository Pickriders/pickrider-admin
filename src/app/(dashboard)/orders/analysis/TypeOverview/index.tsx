import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const TypeOverview = () => {
  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">
        Type Overview
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Total Orders
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center rounded-full bg-[#000]">
              <SVG.DeliveryBox />
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
            Single Order
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center rounded-full bg-[#505582]">
              <SVG.DeliveryBox />
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
            Batch Delivery
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            {/* <BatchIcon /> */}
            <div className="size-[2.9rem] grid place-items-center rounded-full bg-[#3FA49F]">
              <SVG.DeliveryBox />
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
            Bulk Pickup
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <div className="size-[2.9rem] grid place-items-center rounded-full bg-[#2282C8]">
              <SVG.DeliveryBox />
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
        <Link href={"/orders/more-orders-types"}>
          More details <ChevronRight size={15} />
        </Link>
      </UI.Button>
    </div>
  );
};
