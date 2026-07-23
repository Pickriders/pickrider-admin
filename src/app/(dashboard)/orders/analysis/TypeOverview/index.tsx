"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGetOrderAnalyticsQuery } from "@/api/queries/orders";

const TILES = [
  { key: "total", title: "Total Orders", iconBg: "bg-[#000]" },
  { key: "single", title: "Single Order", iconBg: "bg-[#505582]" },
  { key: "batch", title: "Batch Delivery", iconBg: "bg-[#3FA49F]" },
  { key: "bulk", title: "Bulk Pickup", iconBg: "bg-[#2282C8]" },
];

const WowBadge = ({ change }: { change: number | null | undefined }) => {
  if (change === null || change === undefined) {
    return <span className="text-primary-gray font-semibold font-montserrat text-xs">new</span>;
  }
  const positive = change >= 0;
  return (
    <span
      style={{ color: positive ? "#32BA7C" : "#FF5244" }}
      className="font-semibold font-montserrat text-xs"
    >
      {positive ? "+" : "-"} {Math.abs(change).toFixed(2)}%
    </span>
  );
};

export const TypeOverview = () => {
  const { data, isLoading } = useGetOrderAnalyticsQuery();

  const totalCount = (data?.typeTotals?.single ?? 0) + (data?.typeTotals?.batch ?? 0) + (data?.typeTotals?.bulk ?? 0);
  const totalWow = (() => {
    const changes = ["single", "batch", "bulk"].map((key) => data?.typeWow?.[key]);
    if (changes.every((c) => c === null || c === undefined)) return null;
    const valid = changes.filter((c): c is number => typeof c === "number");
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  })();

  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">Type Overview</h2>
      <div className="mt-4 grid sm:grid-cols-2 grid-cols-1 gap-3">
        {TILES.map((tile) => {
          const count = tile.key === "total" ? totalCount : data?.typeTotals?.[tile.key] ?? 0;
          const change = tile.key === "total" ? totalWow : data?.typeWow?.[tile.key];
          return (
            <div key={tile.key} className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
              <h2 className="text-primary-gray text-sm font-montserrat font-semibold">{tile.title}</h2>
              <div className="flex items-center gap-x-4 mt-3">
                <div className={`size-[2.9rem] grid place-items-center rounded-full ${tile.iconBg}`}>
                  <SVG.DeliveryBox />
                </div>
                <span className="font-clash-display font-semibold text-2xl ">{isLoading ? "—" : count}</span>
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
        <Link href={"/orders/more-orders-types"}>
          More details <ChevronRight size={15} />
        </Link>
      </UI.Button>
    </div>
  );
};
