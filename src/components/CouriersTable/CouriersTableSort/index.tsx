"use client";

import { useURLQuery } from "@/hooks";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// A leaderboard is always highest / most-recent first, so every option sorts DESC.
const SORTS = [
  { label: "Deliveries", value: "completedDeliveries" },
  { label: "Amount made", value: "totalEarned" },
  { label: "Last login", value: "lastLoginDate" },
  { label: "Newest", value: "createdAt" },
];

export const CouriersTableSort = () => {
  const searchParams = useSearchParams();
  const { setMultiple } = useURLQuery();
  const active = searchParams.get("sortBy") || "completedDeliveries";

  const select = (value: string) => setMultiple({ sortBy: value, order: "DESC", page: "1" });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-semibold text-primary-gray">Top by</span>
      {SORTS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => select(s.value)}
          className={cn(
            "min-h-9 rounded-full px-3 text-xs font-bold transition-colors",
            active === s.value
              ? "bg-primary text-white"
              : "border bg-background text-primary-gray hover:text-foreground hover:border-primary/40",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
