"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "brand" | "dark";
  trend?: number | null;
  trendSuffix?: string;
  footer?: React.ReactNode;
  sparkData?: any[];
  sparkKey?: string;
  accent?: string;
  className?: string;
  loading?: boolean;
};

export const StatCard = ({
  label,
  value,
  icon,
  tone = "default",
  trend,
  trendSuffix = "vs last week",
  footer,
  sparkData,
  sparkKey,
  accent,
  className,
  loading,
}: StatCardProps) => {
  const isDarkTone = tone === "dark" || tone === "brand";
  const trendUp = (trend ?? 0) >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        tone === "brand" && "border-transparent bg-gradient-to-br from-brand to-brand-dark text-white",
        tone === "dark" && "border-transparent bg-primary-black text-white",
        tone === "default" && "bg-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-xs font-medium", isDarkTone ? "text-white/70" : "text-muted-foreground")}>{label}</p>
          <p className="mt-2 font-clash-display text-2xl font-semibold tracking-tight">
            {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-current/20" /> : value}
          </p>
        </div>
        {icon && (
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              isDarkTone ? "bg-white/15 text-white" : "bg-brand-soft text-brand-dark",
            )}
            style={!isDarkTone && accent ? { backgroundColor: `${accent}1a`, color: accent } : undefined}
          >
            {icon}
          </span>
        )}
      </div>

      {sparkData && sparkKey ? (
        <div className="mt-3 -mx-1">
          <Sparkline data={sparkData} dataKey={sparkKey} color={isDarkTone ? "rgba(255,255,255,0.8)" : accent} />
        </div>
      ) : null}

      {(trend != null || footer) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend != null && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                isDarkTone
                  ? "bg-white/15 text-white"
                  : trendUp
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500",
              )}
            >
              {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          <span className={cn(isDarkTone ? "text-white/70" : "text-muted-foreground")}>{footer ?? trendSuffix}</span>
        </div>
      )}
    </div>
  );
};
