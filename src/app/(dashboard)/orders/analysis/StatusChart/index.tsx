"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { day: "21", completed: 4, rejected: 7, cancelled: 3, missed: 4 },
  { day: "22", completed: 9, rejected: 4, cancelled: 2, missed: 8 },
  { day: "23", completed: 7, rejected: 3, cancelled: 4, missed: 4 },
  { day: "24", completed: 8, rejected: 5, cancelled: 3, missed: 2 },
  { day: "25", completed: 8, rejected: 6, cancelled: 2, missed: 4 },
  { day: "26", completed: 7, rejected: 4, cancelled: 1, missed: 5 },
  { day: "27", completed: 5, rejected: 8, cancelled: 3, missed: 6 },
];

export const StatusChart = () => {
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
          <BarChart data={data}>
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
