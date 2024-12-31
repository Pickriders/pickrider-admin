"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import React from "react";
import { useSearchParams } from "next/navigation";

type Entry = {
  day: string;
  completed: number | null;
  rejected: number | null;
  cancelled: number | null;
  missed: number | null;
};

const initialData = [
  { day: "21", completed: 4, rejected: 7, cancelled: 3, missed: 4 },
  { day: "22", completed: 9, rejected: 4, cancelled: 2, missed: 8 },
  { day: "23", completed: 7, rejected: 3, cancelled: 4, missed: 4 },
  { day: "24", completed: 8, rejected: 5, cancelled: 3, missed: 2 },
  { day: "25", completed: 8, rejected: 6, cancelled: 2, missed: 4 },
  { day: "26", completed: 7, rejected: 4, cancelled: 1, missed: 5 },
  { day: "27", completed: 5, rejected: 8, cancelled: 3, missed: 6 },
];

type Status = "completed" | "rejected" | "cancelled" | "missed";

type StatusParams = {
  [key in Status]: boolean;
};

export const StatusChart = () => {
  const searchParams = useSearchParams();

  const { cancelled, completed, missed, rejected }: Partial<StatusParams> =
    Object.fromEntries(
      [...searchParams.entries()].map(([key, value]) => [
        key as Status,
        value === "true",
      ])
    );

  const filteredDataFunc = () => {
    let filteredData = initialData.map((entry) => {
      let updatedEntry = { ...(entry as Entry) };

      if (searchParams.has("cancelled") && !cancelled) {
        updatedEntry.cancelled = null;
      }

      if (searchParams.has("completed") && !completed) {
        updatedEntry.completed = null;
      }

      if (searchParams.has("missed") && !missed) {
        updatedEntry.missed = null;
      }

      if (searchParams.has("rejected") && !rejected) {
        updatedEntry.rejected = null;
      }

      if (searchParams.has("cancelled") && cancelled) {
        updatedEntry.cancelled = entry.cancelled;
      }

      if (searchParams.has("completed") && completed) {
        updatedEntry.completed = entry.completed;
      }

      if (searchParams.has("missed") && missed) {
        updatedEntry.missed = entry.missed;
      }

      if (searchParams.has("rejected") && rejected) {
        updatedEntry.rejected = entry.rejected;
      }

      return updatedEntry;
    });

    return filteredData;
  };

  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">
        Status Chart
      </h2>
      <div className="mt-4">
        <ChartContainer
          config={{
            completed: {
              label: "Completed",
              color: "hsl(142, 76%, 36%)",
            },
            rejected: {
              label: "Rejected",
              color: "#505582",
            },
            cancelled: {
              label: "Cancelled",
              color: "hsl(346, 87%, 48%)",
            },
            missed: {
              label: "Missed",
              color: "#2E1030",
            },
          }}
          className="h-[353px] w-full"
        >
          <BarChart data={filteredDataFunc()}>
            <CartesianGrid vertical={false} strokeDasharray="4" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              label={{ value: "Day", position: "bottom", offset: 0 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              label={{ value: "No of Orders", angle: -90, position: "top" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="rejected"
              fill="var(--color-rejected)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="cancelled"
              fill="var(--color-cancelled)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="missed"
              fill="var(--color-missed)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
