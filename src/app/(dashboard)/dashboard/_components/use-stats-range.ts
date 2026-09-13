"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { allTimeRange, presetRange, rangeToQuery, type RangeValue } from "@/components/kit/range-tabs";

/**
 * The stats window lives in the URL (`range=7|30|90|all` or `from`/`to`) so a
 * view can be shared and the back button restores it. Also decides the series
 * bucket from the window length: days up to six weeks, then weeks, then months.
 */
export type Bucket = "day" | "week" | "month";

const PRESETS = [7, 30, 90];

export function bucketFor(range: RangeValue): Bucket {
  if (range.all) return "week";
  const days = daysIn(range);
  return days > 120 ? "month" : days > 45 ? "week" : "day";
}

export function daysIn(range: RangeValue) {
  if (range.preset && range.preset > 0) return range.preset;
  if (range.from && range.to) {
    return Math.max(1, Math.round((new Date(range.to).getTime() - new Date(range.from).getTime()) / 86_400_000) + 1);
  }
  return 30;
}

/** Axis label for a series bucket, Lagos time. */
export function bucketLabel(bucket: Bucket) {
  return (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    if (bucket === "month") return date.toLocaleDateString("en-NG", { month: "short", year: "2-digit", timeZone: "Africa/Lagos" });
    return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
  };
}

export function useStatsRange(defaultDays = 30) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const value = useMemo<RangeValue>(() => {
    const raw = params.get("range");
    if (raw === "all") return allTimeRange();
    if (raw && PRESETS.includes(Number(raw))) return presetRange(Number(raw));
    const from = params.get("from") || undefined;
    const to = params.get("to") || undefined;
    if (from || to) return { from, to };
    return presetRange(defaultDays);
  }, [params, defaultDays]);

  const setValue = useCallback(
    (next: RangeValue) => {
      const search = new URLSearchParams(params.toString());
      search.delete("range");
      search.delete("from");
      search.delete("to");
      if (next.all) search.set("range", "all");
      else if (next.preset && next.preset > 0) search.set("range", String(next.preset));
      else {
        if (next.from) search.set("from", next.from);
        if (next.to) search.set("to", next.to);
      }
      const query = search.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const query = useMemo(() => rangeToQuery(value), [value]);
  const bucket = bucketFor(value);
  const days = daysIn(value);
  const label = value.all ? "all time" : `last ${days} days`;

  return { value, setValue, query, bucket, days, label, xf: bucketLabel(bucket) };
}
