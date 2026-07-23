"use client";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart";
import React from "react";
import { Pie, PieChart } from "recharts";
import { useGetOrderAnalyticsQuery } from "@/api/queries/orders";

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

type ActiveSegments = Record<string, boolean>;

export const TypeChart = () => {
  const { data } = useGetOrderAnalyticsQuery();
  const [activeSegments, setActiveSegments] = React.useState<ActiveSegments>({
    "Bulk pickup": true,
    "Single order": true,
    "Batch delivery": true,
  });

  const single = data?.typeTotals?.single ?? 0;
  const batch = data?.typeTotals?.batch ?? 0;
  const bulk = data?.typeTotals?.bulk ?? 0;
  const total = single + batch + bulk;
  const pct = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

  const segments = [
    { name: "Bulk pickup", value: bulk, percent: pct(bulk), fill: "#2282C8" },
    { name: "Single order", value: single, percent: pct(single), fill: "#505582" },
    { name: "Batch delivery", value: batch, percent: pct(batch), fill: "#3FA49F" },
  ];

  const toggleSegment = (name: string) => {
    setActiveSegments((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const filteredData = segments.filter((segment) => activeSegments[segment.name] && segment.value > 0);

  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">Type Chart</h2>
      <div className="mt-4 flex sm:flex-row flex-col sm:items-center">
        <div>
          <h4 className="text-xs font-bold font-montserrat">Distribution</h4>
          <div className="mt-2 space-y-2">
            {segments.map((segment) => (
              <button
                key={segment.name}
                className="flex items-center gap-x-1.5 text-primary-gray font-bold font-montserrat text-xs"
                onClick={() => toggleSegment(segment.name)}
              >
                <div
                  className="rounded-full size-[10px]"
                  style={{
                    backgroundColor: segment.fill,
                    opacity: activeSegments[segment.name] ? 1 : 0.3,
                  }}
                />
                <span
                  style={{
                    color: segment.fill,
                    opacity: activeSegments[segment.name] ? 1 : 0.3,
                  }}
                >
                  {segment.percent}%
                </span>
                {segment.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <ChartContainer config={chartConfig} className="w-full max-w-[20rem]  h-[18rem]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={filteredData}
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
