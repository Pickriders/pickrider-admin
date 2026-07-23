import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, GetOrdersParams, Order } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import React from "react";
import { keepPreviousData } from "@tanstack/react-query";

export const ORDER_KEY = {
  ORDERS: "orders",
};

export const useGetOrdersQuery = (query: GetOrdersParams = {}) =>
  useApiQuery({
    queryKey: [ORDER_KEY.ORDERS, query],
    queryFn: () => apiService.getOrders(query),
  });

export const useGetOrdersReactTableQuery = (
  columns: ColumnDef<Order>[],
  query: GetOrdersParams,
  tableOptions?: UseApiReactTableQueryOptions<Order>,
) => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";
  const orderType = searchParams.get("orderType") || "ALL";

  const filters = React.useMemo(() => {
    const queries: GetOrdersParams = {
      page: Number(searchParams.get("page") ?? 1),
      ...query,
    };

    if (status !== "ALL") {
      queries.status = status;
    }

    if (orderType !== "ALL") {
      queries.type = orderType;
    }

    return queries;
  }, [searchParams, query, status, orderType]);

  const res = useApiReactTableQuery(
    {
      queryKey: [ORDER_KEY.ORDERS, filters],
      queryFn: () => apiService.getOrders(filters),
      placeholderData: keepPreviousData,
    },
    { columns, ...tableOptions },
  );

  return res;
};

export const useGetOrderQuery = (orderId: string) =>
  useApiQuery({
    queryKey: [ORDER_KEY.ORDERS, orderId],
    queryFn: () => apiService.getOrder({ orderId }),
    enabled: !!orderId,
  });

/** Live order counts per status for the orders board summary tiles. */
export const useGetOrderStatusCountsQuery = () =>
  useApiQuery({
    queryKey: [ORDER_KEY.ORDERS, "status-counts"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const [total, initiated, accepted, ongoing, completed, cancelled] = await Promise.all([
        apiService.getOrders({ limit: 1 }),
        apiService.getOrders({ limit: 1, status: "INITIATED" }),
        apiService.getOrders({ limit: 1, status: "ACCEPTED" }),
        apiService.getOrders({ limit: 1, status: "ON_GOING" }),
        apiService.getOrders({ limit: 1, status: "COMPLETED" }),
        apiService.getOrders({ limit: 1, status: "CANCELLED" }),
      ]);
      return {
        total: total?.totalRecords ?? 0,
        initiated: initiated?.totalRecords ?? 0,
        accepted: accepted?.totalRecords ?? 0,
        ongoing: ongoing?.totalRecords ?? 0,
        completed: completed?.totalRecords ?? 0,
        cancelled: cancelled?.totalRecords ?? 0,
      };
    },
  });

/** Statuses the backend actually has — there is no REJECTED/MISSED. */
export const ORDER_STATUS_SERIES = [
  { key: "completed", status: "COMPLETED", label: "Completed" },
  { key: "cancelled", status: "CANCELLED", label: "Cancelled" },
  { key: "ongoing", status: "ON_GOING", label: "Ongoing" },
  { key: "pending", status: "INITIATED", label: "Pending" },
] as const;

export const ORDER_TYPE_SERIES = [
  { key: "single", type: "SINGLE", label: "Single Order" },
  { key: "batch", type: "BATCH", label: "Batch Delivery" },
  { key: "bulk", type: "BULK", label: "Bulk Pickup" },
] as const;

export type OrderAnalytics = {
  /** All-time counts per status key. */
  totals: Record<string, number>;
  /** All-time counts per type key. */
  typeTotals: Record<string, number>;
  /** Week-over-week % change per status key (this 7 days vs prior 7 days). */
  wow: Record<string, number | null>;
  typeWow: Record<string, number | null>;
  /** Last 7 days, one entry per day, counts per status key. */
  chart: Array<Record<string, string | number>>;
  typeChart: Array<Record<string, string | number>>;
};

const dateKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const wowChange = (current: number, prior: number): number | null => {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
};

/**
 * Aggregates order analytics client-side: all-time counts via limit-1 pages
 * and a single 14-day fetch (capped at 1000 records) bucketed per day for the
 * chart + week-over-week badges.
 */
export const useGetOrderAnalyticsQuery = () =>
  useApiQuery({
    queryKey: [ORDER_KEY.ORDERS, "analytics"],
    queryFn: async (): Promise<OrderAnalytics> => {
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 13);

      const [statusCounts, typeCounts, recent] = await Promise.all([
        Promise.all(
          ORDER_STATUS_SERIES.map((s) => apiService.getOrders({ limit: 1, status: s.status })),
        ),
        Promise.all(ORDER_TYPE_SERIES.map((t) => apiService.getOrders({ limit: 1, type: t.type }))),
        apiService.getOrders({ dateRange: `${fmt(start)},${fmt(end)}`, limit: 1000, order: "DESC" }),
      ]);

      const totals: Record<string, number> = {};
      ORDER_STATUS_SERIES.forEach((s, i) => (totals[s.key] = statusCounts[i]?.totalRecords ?? 0));
      const typeTotals: Record<string, number> = {};
      ORDER_TYPE_SERIES.forEach((t, i) => (typeTotals[t.key] = typeCounts[i]?.totalRecords ?? 0));

      // Build the last-7-days buckets (oldest first).
      const days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(dateKey(d.toISOString()));
      }
      const weekCutoff = days[0];

      const chart = days.map((day) => {
        const entry: Record<string, string | number> = { day: day.slice(8) };
        ORDER_STATUS_SERIES.forEach((s) => (entry[s.key] = 0));
        return entry;
      });
      const typeChart = days.map((day) => {
        const entry: Record<string, string | number> = { day: day.slice(8) };
        ORDER_TYPE_SERIES.forEach((t) => (entry[t.key] = 0));
        return entry;
      });

      const thisWeek: Record<string, number> = {};
      const priorWeek: Record<string, number> = {};
      const typeThisWeek: Record<string, number> = {};
      const typePriorWeek: Record<string, number> = {};

      for (const order of recent?.results ?? []) {
        const day = dateKey(order.createdAt);
        const statusEntry = ORDER_STATUS_SERIES.find((s) => s.status === order.status);
        const typeEntry = ORDER_TYPE_SERIES.find((t) => t.type === order.type);
        const inThisWeek = day >= weekCutoff;

        if (statusEntry) {
          const bucket = inThisWeek ? thisWeek : priorWeek;
          bucket[statusEntry.key] = (bucket[statusEntry.key] ?? 0) + 1;
          if (inThisWeek) {
            const row = chart[days.indexOf(day)];
            if (row) row[statusEntry.key] = (row[statusEntry.key] as number) + 1;
          }
        }
        if (typeEntry) {
          const bucket = inThisWeek ? typeThisWeek : typePriorWeek;
          bucket[typeEntry.key] = (bucket[typeEntry.key] ?? 0) + 1;
          if (inThisWeek) {
            const row = typeChart[days.indexOf(day)];
            if (row) row[typeEntry.key] = (row[typeEntry.key] as number) + 1;
          }
        }
      }

      const wow: Record<string, number | null> = {};
      ORDER_STATUS_SERIES.forEach((s) => {
        wow[s.key] = wowChange(thisWeek[s.key] ?? 0, priorWeek[s.key] ?? 0);
      });
      const typeWow: Record<string, number | null> = {};
      ORDER_TYPE_SERIES.forEach((t) => {
        typeWow[t.key] = wowChange(typeThisWeek[t.key] ?? 0, typePriorWeek[t.key] ?? 0);
      });

      return { totals, typeTotals, wow, typeWow, chart, typeChart };
    },
  });
