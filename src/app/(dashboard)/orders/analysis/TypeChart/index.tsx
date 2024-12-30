"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

const data = [
  { name: "Bulk pickup", value: 50, fill: "#2282C8" },
  { name: "Single order", value: 25, fill: "#505582" },
  { name: "Batch delivery", value: 25, fill: "#3FA49F" },
];

const chartConfig = {
  value: {
    label: "Value",
  },
  bulk_pickup: {
    label: "Bulk pickup",
    color: "#2282C8",
  },
  single_order: {
    label: "Single order",
    color: "#505582",
  },
  batch_delivery: {
    label: "Batch delivery",
    color: "#3FA49F",
  },
} satisfies ChartConfig;

export const TypeChart = () => {
  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">
        Type Chart
      </h2>
      <div className="mt-4 flex items-center">
        <div>
          <h4 className="text-xs font-bold font-montserrat">Distribution</h4>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center gap-x-1.5 text-primary-gray font-bold font-montserrat text-xs">
              <div className="bg-[#505582] rounded-full size-[10px]" />
              <span className="text-[#505582]">25%</span>
              Single order
            </li>
            <li className="flex items-center gap-x-1.5 text-primary-gray font-bold font-montserrat text-xs">
              <div className="bg-[#3FA49F] rounded-full size-[10px]" />
              <span className="text-[#3FA49F]">25%</span>
              Batch delivery
            </li>
            <li className="flex items-center gap-x-1.5 text-primary-gray font-bold font-montserrat text-xs">
              <div className="bg-[#2282C8] rounded-full size-[10px]" />
              <span className="text-[#2282C8]">25%</span>
              Bulk pickup
            </li>
          </ul>
        </div>
        <div className="flex-1">
          <ChartContainer config={chartConfig} className="w-[20rem]  h-[18rem]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                paddingAngle={5}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};
