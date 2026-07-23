"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Entry, Status, StatusParams } from "./StatusChart.type";
import { useGetOrderAnalyticsQuery } from "@/api/queries/orders";

const SERIES: Status[] = ["completed", "ongoing", "cancelled", "pending"];

export const StatusChart = () => {
  const searchParams = useSearchParams();
  const { data } = useGetOrderAnalyticsQuery();

  const toggles: Partial<StatusParams> = Object.fromEntries(
    [...searchParams.entries()].map(([key, value]) => [key as Status, value === "true"]),
  );

  // Last 7 days of real per-status counts; a series toggled off via the URL
  // params (see Distributions) is nulled so its bars disappear.
  const chartData: Entry[] = (data?.chart ?? []).map((row) => {
    const entry = { ...row } as unknown as Entry;
    for (const key of SERIES) {
      if (searchParams.has(key) && !toggles[key]) entry[key] = null;
    }
    return entry;
  });

  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">Status Chart</h2>
      <div className="mt-4">
        <p className="text-[10px] pl-9 text-primary-gray font-montserrat font-semibold ">No of Orders</p>
        <ChartContainer
          config={{
            completed: {
              label: "Completed",
              color: "hsl(142, 76%, 36%)",
            },
            ongoing: {
              label: "Ongoing",
              color: "#505582",
            },
            cancelled: {
              label: "Cancelled",
              color: "hsl(346, 87%, 48%)",
            },
            pending: {
              label: "Pending",
              color: "#2E1030",
            },
          }}
          className="h-[353px]  w-full"
        >
          <BarChart data={chartData} className="w-[30rem]">
            <CartesianGrid vertical={false} strokeDasharray="4" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(value) => `${value}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="ongoing" fill="var(--color-ongoing)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="cancelled" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
        <p className="text-[10px] text-primary-gray font-montserrat font-semibold text-end">Day</p>
      </div>
    </div>
  );
};
