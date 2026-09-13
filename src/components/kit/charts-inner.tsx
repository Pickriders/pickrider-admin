"use client";

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
import { naira, nairaCompact, count, countCompact } from "@/lib/admin/format";
import type { SeriesSpec } from "@/components/kit/charts";

/**
 * The recharts half of the chart kit, split out so it can be dynamically
 * imported. Colours come from the admin CSS variables so dark mode is free.
 */
const VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6"];
const colorAt = (index: number, override?: string) => override ?? `hsl(var(${VARS[index % VARS.length]}))`;

const axis = {
  tick: { fontSize: 11, fill: "hsl(var(--ink-faint))" },
  axisLine: false as const,
  tickLine: false as const,
};

function fmt(kind: SeriesSpec["format"] | "naira" | "count" | undefined, value: unknown, compact = false) {
  const n = typeof value === "number" ? value : Number(value) || 0;
  if (kind === "naira") return compact ? nairaCompact(n) : naira(n);
  if (kind === "percent") return `${n}%`;
  return compact ? countCompact(n) : count(n);
}

function TooltipBox({
  active,
  payload,
  label,
  series,
  labelFormat,
}: {
  active?: boolean;
  payload?: { dataKey?: string; value?: unknown; color?: string; name?: string }[];
  label?: string;
  series?: SeriesSpec[];
  labelFormat?: (value: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-card-raised px-3 py-2 text-xs shadow-pop">
      {label ? <p className="mb-1 font-bold text-ink">{labelFormat ? labelFormat(String(label)) : String(label)}</p> : null}
      {payload.map((entry, index) => {
        const spec = series?.find((s) => s.key === entry.dataKey);
        return (
          <p key={index} className="flex items-center justify-between gap-4 text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {spec?.label ?? entry.name ?? entry.dataKey}
            </span>
            <span className="font-semibold text-ink">{fmt(spec?.format, entry.value)}</span>
          </p>
        );
      })}
    </div>
  );
}

type Props =
  | {
      chart: "trend";
      data: Record<string, unknown>[];
      xKey: string;
      series: SeriesSpec[];
      kind?: "line" | "area";
      yFormat?: "naira" | "count";
      xFormat?: (value: string) => string;
    }
  | {
      chart: "bars";
      data: Record<string, unknown>[];
      xKey: string;
      series: SeriesSpec[];
      stacked?: boolean;
      yFormat?: "naira" | "count";
      xFormat?: (value: string) => string;
      horizontal?: boolean;
    }
  | {
      chart: "donut";
      data: { name: string; value: number; color?: string }[];
      centerLabel?: string;
      centerValue?: string;
      format?: "naira" | "count";
    }
  | { chart: "spark"; data: Record<string, unknown>[]; dataKey: string; color?: string };

export default function ChartsInner(props: Props) {
  if (props.chart === "spark") {
    return (
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 160 }}>
        <AreaChart data={props.data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={props.color ?? "var(--brand)"} stopOpacity={0.35} />
              <stop offset="100%" stopColor={props.color ?? "var(--brand)"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={props.dataKey}
            stroke={props.color ?? "var(--brand)"}
            strokeWidth={2}
            fill="url(#spark-fill)"
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (props.chart === "donut") {
    const total = props.data.reduce((s, d) => s + d.value, 0);
    const data = total ? props.data : [{ name: "Nothing yet", value: 1, color: "hsl(var(--border))" }];
    return (
      <div className="relative h-full w-full">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 160 }}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="96%"
              paddingAngle={total ? 3 : 0}
              cornerRadius={total ? 6 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colorAt(index, entry.color)} />
              ))}
            </Pie>
            {total ? (
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-line bg-card-raised px-3 py-2 text-xs shadow-pop">
                      <p className="font-bold text-ink">{String(payload[0].name)}</p>
                      <p className="text-ink-muted">
                        {fmt(props.format, payload[0].value)} · {Math.round((Number(payload[0].value) / total) * 100)}%
                      </p>
                    </div>
                  ) : null
                }
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {props.centerValue ? <span className="text-xl font-black tracking-tight text-ink">{props.centerValue}</span> : null}
          {props.centerLabel ? <span className="text-[11px] font-semibold text-ink-faint">{props.centerLabel}</span> : null}
        </div>
      </div>
    );
  }

  const yFormat = props.yFormat ?? props.series[0]?.format ?? "count";
  const yTick = (value: number) => fmt(yFormat, value, true);

  if (props.chart === "bars") {
    const Chart = BarChart;
    return (
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 160 }}>
        <Chart data={props.data} layout={props.horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke="hsl(var(--chart-grid))" vertical={false} strokeDasharray="0" />
          {props.horizontal ? (
            <>
              <XAxis type="number" {...axis} tickFormatter={yTick} />
              <YAxis type="category" dataKey={props.xKey} {...axis} width={110} />
            </>
          ) : (
            <>
              <XAxis dataKey={props.xKey} {...axis} tickFormatter={props.xFormat} minTickGap={16} />
              <YAxis {...axis} tickFormatter={yTick} width={44} />
            </>
          )}
          <Tooltip cursor={{ fill: "hsl(var(--surface))" }} content={<TooltipBox series={props.series} labelFormat={props.xFormat} />} />
          {props.series.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId={props.stacked ? "stack" : undefined}
              fill={colorAt(index, s.color)}
              radius={props.stacked && index < props.series.length - 1 ? 0 : [6, 6, 0, 0]}
              isAnimationActive={false}
              maxBarSize={36}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    );
  }

  // trend
  if (props.kind === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 160 }}>
        <LineChart data={props.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--chart-grid))" vertical={false} />
          <XAxis dataKey={props.xKey} {...axis} tickFormatter={props.xFormat} minTickGap={16} />
          <YAxis {...axis} tickFormatter={yTick} width={44} />
          <Tooltip cursor={{ stroke: "hsl(var(--line-strong))" }} content={<TooltipBox series={props.series} labelFormat={props.xFormat} />} />
          {props.series.map((s, index) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={colorAt(index, s.color)}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 160 }}>
      <AreaChart data={props.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {props.series.map((s, index) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorAt(index, s.color)} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colorAt(index, s.color)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="hsl(var(--chart-grid))" vertical={false} />
        <XAxis dataKey={props.xKey} {...axis} tickFormatter={props.xFormat} minTickGap={16} />
        <YAxis {...axis} tickFormatter={yTick} width={44} />
        <Tooltip cursor={{ stroke: "hsl(var(--line-strong))" }} content={<TooltipBox series={props.series} labelFormat={props.xFormat} />} />
        {props.series.map((s, index) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={colorAt(index, s.color)}
            strokeWidth={2.2}
            fill={`url(#fill-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
