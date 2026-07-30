"use client";

import { cn } from "@/lib/utils";

export const RANGES = [
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" },
] as const;

export const RangeTabs = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
    {RANGES.map((range) => (
      <button
        key={range.id}
        type="button"
        onClick={() => onChange(range.id)}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
          value === range.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {range.label}
      </button>
    ))}
  </div>
);
