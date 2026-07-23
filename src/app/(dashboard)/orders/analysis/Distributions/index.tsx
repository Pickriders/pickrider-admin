"use client";

import { cn } from "@/lib/utils";
import { Crosshair } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "completed" | "ongoing" | "cancelled" | "pending";

const LEGEND: Array<{ key: Status; label: string; color: string }> = [
  { key: "completed", label: "Completed Order", color: "#32BA7C" },
  { key: "cancelled", label: "Cancelled Order", color: "#FF5244" },
  { key: "ongoing", label: "Ongoing Order", color: "#505582" },
  { key: "pending", label: "Pending Order", color: "#1E1F1F" },
];

export const Distributions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggles = Object.fromEntries(
    [...searchParams.entries()].map(([key, value]) => [key as Status, value === "true"]),
  ) as Partial<Record<Status, boolean>>;

  const toggleURLStatus = (status: Status) => {
    const currentValue = searchParams.get(status) === "true";
    const newParams = new URLSearchParams(searchParams.toString());

    if (!searchParams.has(status) || currentValue) {
      newParams.set(status, "false");
    } else {
      newParams.set(status, "true");
    }

    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold font-montserrat text-xs text-end">Distribution</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2 justify-end mt-4">
        {LEGEND.map((item) => (
          <button
            key={item.key}
            onClick={() => toggleURLStatus(item.key)}
            className={cn("flex items-center gap-x-3", toggles[item.key] === false ? "opacity-30" : "")}
          >
            <div className="size-[10px] rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-bold font-montserrat text-xs">{item.label}</span>
            <Crosshair size={24} className="text-primary-gray" />
          </button>
        ))}
      </div>
    </div>
  );
};
