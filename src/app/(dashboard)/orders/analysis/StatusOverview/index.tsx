"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGetOrderAnalyticsQuery } from "@/api/queries/orders";

const TILES = [
  {
    key: "completed",
    title: "Completed Orders",
    iconBg: "bg-[#32BA7C]",
    icon: <SVG.PackageDelivered />,
  },
  {
    key: "cancelled",
    title: "Cancelled Orders",
    iconBg: "bg-[#FF5244]",
    icon: <SVG.PackageRemove />,
  },
  {
    key: "ongoing",
    title: "Ongoing Deliveries",
    iconBg: "bg-[#505582]",
    icon: <SVG.PackageOutOfStock />,
  },
  {
    key: "pending",
    title: "Pending Orders",
    iconBg: "bg-[#000]",
    icon: <SVG.PackageOpen />,
  },
];

const WowBadge = ({ change }: { change: number | null | undefined }) => {
  if (change === null || change === undefined) {
    return <span className="text-primary-gray font-semibold font-montserrat text-xs">new</span>;
  }
  const positive = change >= 0;
  const color = positive ? "#32BA7C" : "#FF5244";
  return (
    <span style={{ color }} className="font-semibold font-montserrat text-xs">
      {positive ? "+" : "-"} {Math.abs(change).toFixed(2)}%
    </span>
  );
};

export const StatusOverview = () => {
  const { data, isLoading } = useGetOrderAnalyticsQuery();

  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">Status Overview</h2>
      <div className="mt-4 grid sm:grid-cols-2 grid-cols-1 gap-3">
        {TILES.map((tile) => {
          const change = data?.wow?.[tile.key];
          return (
            <div key={tile.key} className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
              <h2 className="text-primary-gray text-sm font-montserrat font-semibold">{tile.title}</h2>
              <div className="flex items-center gap-x-4 mt-3">
                <div className={`size-[2.9rem] grid place-items-center ${tile.iconBg} rounded-full`}>{tile.icon}</div>
                <span className="font-clash-display font-semibold text-2xl ">
                  {isLoading ? "—" : data?.totals?.[tile.key] ?? 0}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <SVG.ChartIcon
                  className={change !== null && change !== undefined && change < 0 ? "fill-[#FF5244]" : "fill-[#32BA7C]"}
                />
                <WowBadge change={change} />
              </div>
            </div>
          );
        })}
      </div>
      <UI.Button variant={"ghost"} className="mt-5" asChild>
        <Link href={"/orders/more-orders"}>
          More details <ChevronRight size={15} />
        </Link>
      </UI.Button>
    </div>
  );
};
