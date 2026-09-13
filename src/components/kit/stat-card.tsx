"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkline } from "@/components/kit/charts";
import { Panel, Skeleton, cx } from "@/components/kit/primitives";

/**
 * A KPI tile. `tone="brand"` is reserved for the single headline number on a
 * page; everything else stays on the card colour so the page reads calm.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  trend,
  trendLabel = "vs previous period",
  spark,
  sparkKey = "value",
  loading,
  className,
  onClick,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "brand" | "dark";
  trend?: number | null;
  trendLabel?: ReactNode;
  spark?: Record<string, unknown>[];
  sparkKey?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const dark = tone !== "default";
  // brand sits on teal in both themes, so white text always reads; the dark
  // tile sits on the ink colour, which flips in dark mode, so it uses the card
  // colour (which flips with it) rather than white.
  const fg = tone === "dark" ? "text-card" : "text-white";
  const fgMuted = tone === "dark" ? "text-card/70" : "text-white/70";
  const chip = tone === "dark" ? "bg-card/15 text-card" : "bg-white/15 text-white";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cx("truncate text-xs font-semibold", dark ? fgMuted : "text-ink-muted")}>{label}</p>
          <div className={cx("mt-3 text-[30px] font-black leading-none tracking-tight", dark ? fg : "text-ink")}>
            {loading ? <Skeleton className={cx("h-7 w-24", dark && "bg-white/20")} /> : value}
          </div>
        </div>
        {Icon ? (
          <span
            className={cx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              dark ? chip : "bg-brand-soft text-brand-dark",
            )}
          >
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      {spark && spark.length > 1 ? (
        <div className="-mx-1 mt-3">
          <Sparkline data={spark} dataKey={sparkKey} color={tone === "brand" ? "rgba(255,255,255,0.85)" : tone === "dark" ? "hsl(var(--card))" : undefined} />
        </div>
      ) : null}
      {trend != null || hint ? (
        <div className={cx("mt-3 flex items-center gap-2 text-xs", dark ? fgMuted : "text-ink-muted")}>
          {trend != null ? (
            <span
              className={cx(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold",
                dark
                  ? chip
                  : trend > 0
                    ? "bg-success-soft text-success"
                    : trend < 0
                      ? "bg-danger-soft text-danger"
                      : "bg-surface text-ink-muted",
              )}
            >
              {trend > 0 ? <ArrowUpRight size={12} /> : trend < 0 ? <ArrowDownRight size={12} /> : null}
              {Math.abs(trend)}%
            </span>
          ) : null}
          <span className="truncate">{hint ?? trendLabel}</span>
        </div>
      ) : null}
    </>
  );

  const classes = cx(
    "relative overflow-hidden p-6 transition-shadow",
    tone === "brand" && "border-transparent bg-gradient-to-br from-brand to-brand-dark",
    tone === "dark" && "border-transparent bg-ink",
    onClick && "cursor-pointer hover:shadow-pop",
    className,
  );

  if (onClick) {
    return (
      <Panel className={classes} onClick={onClick} role="button" tabIndex={0}>
        {body}
      </Panel>
    );
  }
  return <Panel className={classes}>{body}</Panel>;
}

export function StatGrid({ children, columns = 4 }: { children: ReactNode; columns?: 2 | 3 | 4 | 5 | 6 }) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 xl:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }[columns];
  return <div className={cx("grid grid-cols-1 gap-4 md:gap-5", cols)}>{children}</div>;
}
