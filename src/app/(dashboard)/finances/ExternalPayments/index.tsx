"use client";

import * as React from "react";
import { useGetExternalPaymentMetricsQuery } from "@/api/queries/transaction";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { UI } from "@/components/ui";

const RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "all", label: "All time", days: null },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

function toDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(start)},${fmt(end)}`;
}

/**
 * "Someone Else Pays" adoption metrics — orders funded by a third party via
 * the shareable /pay/:token link. Money values arrive in sub-units.
 */
export const ExternalPayments = () => {
  const [rangeId, setRangeId] = React.useState<RangeId>("30");
  const range = RANGES.find((entry) => entry.id === rangeId) ?? RANGES[1];
  const dateRange = range.days === null ? undefined : toDateRange(range.days);
  const { data, isLoading } = useGetExternalPaymentMetricsQuery(dateRange);

  const money = (value?: number) => formatMoney(subUnitToBaseUnit(value ?? 0), { currency: "NGN" });

  const tiles = [
    { label: "Payments", value: `${data?.count ?? 0}`, marker: "#32BA7C" },
    { label: "Total Funded", value: money(data?.totalFunded), marker: "#3FA49F" },
    { label: "Fees Charged", value: money(data?.totalFees), marker: "#F2A93B" },
    { label: "Net Received", value: money(data?.netReceived), marker: "#7C6DF6" },
    { label: "Unique Payers", value: `${data?.uniqueCustomers ?? 0}`, marker: "#FF5244" },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between flex-wrap gap-y-3">
        <UI.SectionHeader text="Someone Else Pays" />
        <div className="flex items-center gap-x-1 rounded-lg border p-1">
          {RANGES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setRangeId(entry.id)}
              className={
                "px-3 py-1.5 rounded-md text-xs font-montserrat font-semibold transition-colors " +
                (rangeId === entry.id
                  ? "bg-primary-black text-white"
                  : "text-primary-gray hover:bg-primary-foreground")
              }
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border bg-primary-foreground py-4 px-4 h-[110px]">
            <span className="font-montserrat text-sm text-primary-gray font-semibold">{tile.label}</span>
            <div className="flex mt-2 items-center gap-x-4">
              <div className="h-[2.1rem] w-[4px] rounded-2xl" style={{ backgroundColor: tile.marker }} />
              <span className="font-semibold font-clash-display text-xl truncate">
                {isLoading ? "—" : tile.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
