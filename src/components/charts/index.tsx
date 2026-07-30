"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/** Brand-aligned chart palette (see globals.css --chart-*). */
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export type Series = { key: string; label: string; color?: string };

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
} as const;

/** Shared card shell used by every chart + some stat blocks. */
export const ChartCard = ({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}>
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="font-clash-display font-semibold text-foreground">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
  </div>
);

const TooltipBox = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
      {label != null && <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color ?? entry.payload?.fill }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold text-foreground">
              {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendAreaChart = ({
  data,
  xKey,
  series,
  height = 260,
  type = "area",
  stacked = false,
  currency = false,
}: {
  data: any[];
  xKey: string;
  series: Series[];
  height?: number;
  type?: "area" | "line";
  stacked?: boolean;
  currency?: boolean;
}) => {
  const yFmt = (v: number) =>
    currency
      ? v >= 1000
        ? `₦${(v / 1000).toFixed(0)}k`
        : `₦${v}`
      : v >= 1000
        ? `${(v / 1000).toFixed(1)}k`
        : `${v}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "area" ? (
        <AreaChart data={data} margin={{ left: -12, right: 6, top: 6 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
              return (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...axisProps} minTickGap={20} />
          <YAxis {...axisProps} width={44} tickFormatter={yFmt} allowDecimals={false} />
          <Tooltip content={<TooltipBox />} />
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${s.key})`}
                stackId={stacked ? "a" : undefined}
                dot={false}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ left: -12, right: 6, top: 6 }}>
          <CartesianGrid vertical={false} strokeDasharray="4" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} {...axisProps} minTickGap={20} />
          <YAxis {...axisProps} width={44} tickFormatter={yFmt} allowDecimals={false} />
          <Tooltip content={<TooltipBox />} />
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export const BarSeriesChart = ({
  data,
  xKey,
  series,
  height = 260,
  stacked = false,
}: {
  data: any[];
  xKey: string;
  series: Series[];
  height?: number;
  stacked?: boolean;
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ left: -12, right: 6, top: 6 }}>
      <CartesianGrid vertical={false} strokeDasharray="4" stroke="hsl(var(--border))" />
      <XAxis dataKey={xKey} {...axisProps} minTickGap={16} />
      <YAxis {...axisProps} width={40} allowDecimals={false} />
      <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<TooltipBox />} />
      {series.map((s, i) => {
        const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
        return (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={color}
            radius={stacked ? 0 : [6, 6, 0, 0]}
            stackId={stacked ? "a" : undefined}
            maxBarSize={44}
          />
        );
      })}
    </BarChart>
  </ResponsiveContainer>
);

export type DonutDatum = { name: string; value: number; color: string };

export const DonutChart = ({
  data,
  height = 240,
  centerLabel,
  centerValue,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) => {
  const hasData = data.some((d) => d.value > 0);
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<TooltipBox />} />
          <Pie
            data={hasData ? data : [{ name: "No data", value: 1, color: "hsl(var(--muted))" }]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={hasData ? 3 : 0}
            strokeWidth={0}
          >
            {(hasData ? data : [{ name: "No data", value: 1, color: "hsl(var(--muted))" }]).map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue != null) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue != null && (
            <span className="font-clash-display text-2xl font-semibold text-foreground">{centerValue}</span>
          )}
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
};

/** Tiny inline area used inside stat cards. */
export const Sparkline = ({
  data,
  dataKey,
  color = CHART_COLORS[0],
  height = 40,
}: {
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
      <defs>
        <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#spark-${dataKey})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

/** Small colored legend list shared by donut/bar cards. */
export const ChartLegend = ({ items }: { items: { label: string; value?: React.ReactNode; color: string }[] }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2 text-xs">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="text-muted-foreground">{item.label}</span>
        {item.value != null && <span className="ml-auto font-semibold text-foreground">{item.value}</span>}
      </div>
    ))}
  </div>
);
