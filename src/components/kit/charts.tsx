"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Panel, PanelHeader, Skeleton } from "@/components/kit/primitives";

/**
 * Recharts is loaded on demand so no admin route pays for it until a chart is
 * actually on screen. Everything here reads colour from the admin tokens, so
 * charts follow dark mode without any per-chart work.
 */
const Inner = dynamic(() => import("./charts-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export const CHART_VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6"] as const;

export type SeriesSpec = { key: string; label: string; color?: string; format?: "naira" | "count" | "percent" };

export function ChartCard({
  title,
  subtitle,
  action,
  height = 260,
  children,
  loading,
  empty,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  height?: number;
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
}) {
  return (
    <Panel>
      <PanelHeader title={title} subtitle={subtitle} action={action} />
      <div className="px-4 pb-5 pt-4" style={{ height }}>
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : empty ? (
          <div className="grid h-full place-items-center text-xs font-medium text-ink-faint">Nothing in this window yet</div>
        ) : (
          children
        )}
      </div>
    </Panel>
  );
}

export function TrendChart(props: {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesSpec[];
  kind?: "line" | "area";
  yFormat?: "naira" | "count";
  xFormat?: (value: string) => string;
}) {
  return <Inner chart="trend" {...props} />;
}

export function BarsChart(props: {
  data: Record<string, unknown>[];
  xKey: string;
  series: SeriesSpec[];
  stacked?: boolean;
  yFormat?: "naira" | "count";
  xFormat?: (value: string) => string;
  horizontal?: boolean;
}) {
  return <Inner chart="bars" {...props} />;
}

export function DonutChart(props: {
  data: { name: string; value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string;
  format?: "naira" | "count";
}) {
  return <Inner chart="donut" {...props} />;
}

export function Sparkline(props: { data: Record<string, unknown>[]; dataKey: string; color?: string }) {
  return (
    <div className="h-10 w-full">
      <Inner chart="spark" {...props} />
    </div>
  );
}

export function Heatmap({
  cells,
  maxHint,
}: {
  cells: { day: number; hour: number; count: number }[];
  maxHint?: string;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const blocks = [
    { label: "6 to 9am", hours: [6, 7, 8] },
    { label: "9 to 12pm", hours: [9, 10, 11] },
    { label: "12 to 3pm", hours: [12, 13, 14] },
    { label: "3 to 6pm", hours: [15, 16, 17] },
    { label: "6 to 9pm", hours: [18, 19, 20] },
    { label: "9pm to 12", hours: [21, 22, 23] },
    { label: "Night", hours: [0, 1, 2, 3, 4, 5] },
  ];
  const grid = days.map((_, day) =>
    blocks.map((block) => cells.filter((c) => c.day === day && block.hours.includes(c.hour)).reduce((s, c) => s + c.count, 0)),
  );
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="admin-scroll overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-1 text-[10px] font-semibold text-ink-faint">
          <div />
          {blocks.map((b) => (
            <div key={b.label} className="text-center">
              {b.label}
            </div>
          ))}
          {days.map((label, day) => (
            <div key={label} className="contents">
              <div className="flex items-center text-ink-muted">{label}</div>
              {grid[day].map((value, index) => (
                <div
                  key={index}
                  title={`${label}, ${blocks[index].label}: ${value}`}
                  className="h-8 rounded-md"
                  style={{
                    backgroundColor: value ? `color-mix(in srgb, var(--brand) ${Math.max(12, Math.round((value / max) * 100))}%, hsl(var(--surface)))` : "hsl(var(--surface))",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {maxHint ? <p className="mt-2 text-[11px] text-ink-faint">{maxHint}</p> : null}
      </div>
    </div>
  );
}
