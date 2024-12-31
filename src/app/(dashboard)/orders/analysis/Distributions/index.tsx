"use client";

import { cn } from "@/lib/utils";
import { Crosshair } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "completed" | "rejected" | "cancelled" | "missed";

export const Distributions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cancelled, completed, missed, rejected } = Object.fromEntries(
    [...searchParams.entries()].map(([key, value]) => [
      key as Status,
      value === "true",
    ])
  );

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
      <h2 className="font-bold font-montserrat text-xs text-end">
        Distribution
      </h2>
      <div className="flex gap-x-6 justify-end mt-4">
        <button
          onClick={() => toggleURLStatus("completed")}
          className={cn(
            "flex items-center gap-x-3",
            completed ? "opacity-100" : "opacity-30"
          )}
        >
          <div className="size-[10px] rounded-full bg-[#32BA7C]" />
          <span className="font-bold font-montserrat text-xs">
            Completed Order
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </button>
        <button
          onClick={() => toggleURLStatus("cancelled")}
          className={cn(
            "flex items-center gap-x-3",
            cancelled ? "opacity-100" : "opacity-30"
          )}
        >
          <div className="size-[10px] rounded-full bg-[#FF5244]" />
          <span className="font-bold font-montserrat text-xs">
            Cancelled Order
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </button>
        <button
          onClick={() => toggleURLStatus("rejected")}
          className={cn(
            "flex items-center gap-x-3",
            rejected ? "opacity-100" : "opacity-30"
          )}
        >
          <div className="size-[10px] rounded-full bg-[#505582]" />
          <span className="font-bold font-montserrat text-xs">
            Rejected Order{" "}
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </button>
        <button
          onClick={() => toggleURLStatus("missed")}
          className={cn(
            "flex items-center gap-x-3",
            missed ? "opacity-100" : "opacity-30"
          )}
        >
          <div className="size-[10px] rounded-full bg-[#1E1F1F]" />
          <span className="font-bold font-montserrat text-xs">
            Missed Order
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </button>
      </div>
    </div>
  );
};
