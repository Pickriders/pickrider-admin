import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services";
import { subUnitToBaseUnit } from "@/utils";

/**
 * Platform-wide analytics. The core API has no cross-entity aggregate
 * endpoints, so everything here is derived client-side from the admin list
 * endpoints — limit-1 calls for headline counts, and windowed fetches bucketed
 * per day for the time-series charts.
 */
export const ANALYTICS_KEY = "analytics";

const fmt = (d: Date) => d.toISOString().slice(0, 10);
const dayLabel = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

const total = (res: { totalRecords?: number } | undefined) => res?.totalRecords ?? 0;

export type PlatformOverview = {
  balance: number;
  currency?: string;
  orders: { total: number; completed: number; cancelled: number; ongoing: number; pending: number };
  types: { single: number; batch: number; bulk: number };
  people: {
    customers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    riders: number;
    activeRiders: number;
    inactiveRiders: number;
    businesses: number;
    activeBusinesses: number;
    inactiveBusinesses: number;
  };
  fleet: { vehicles: number; verified: number; pending: number };
  money: { creditTxns: number; debitTxns: number };
};

/** All the headline numbers for the dashboard hero + rings, in one query. */
export const useGetPlatformOverviewQuery = () =>
  useQuery({
    queryKey: [ANALYTICS_KEY, "overview"],
    queryFn: async (): Promise<PlatformOverview> => {
      const wallet = await apiService.getPlatformWallet();

      const [
        ordersTotal,
        completed,
        cancelled,
        ongoing,
        pending,
        single,
        batch,
        bulk,
        customers,
        activeCustomers,
        inactiveCustomers,
        riders,
        activeRiders,
        inactiveRiders,
        businesses,
        activeBusinesses,
        inactiveBusinesses,
        vehicles,
        verified,
        pendingVeh,
        credits,
        debits,
      ] = await Promise.all([
        apiService.getOrders({ limit: 1 }),
        apiService.getOrders({ limit: 1, status: "COMPLETED" }),
        apiService.getOrders({ limit: 1, status: "CANCELLED" }),
        apiService.getOrders({ limit: 1, status: "ON_GOING" }),
        apiService.getOrders({ limit: 1, status: "INITIATED" }),
        apiService.getOrders({ limit: 1, type: "SINGLE" }),
        apiService.getOrders({ limit: 1, type: "BATCH" }),
        apiService.getOrders({ limit: 1, type: "BULK" }),
        apiService.getUsers({ limit: 1, isRider: "false", role: "USER" }),
        apiService.getUsers({ limit: 1, isRider: "false", role: "USER", status: "ACTIVE" }),
        apiService.getUsers({ limit: 1, isRider: "false", role: "USER", status: "INACTIVE" }),
        apiService.getUsers({ limit: 1, isRider: "true" }),
        apiService.getUsers({ limit: 1, isRider: "true", status: "ACTIVE" }),
        apiService.getUsers({ limit: 1, isRider: "true", status: "INACTIVE" }),
        apiService.getUsers({ limit: 1, role: "BUSINESS_ADMIN" }),
        apiService.getUsers({ limit: 1, role: "BUSINESS_ADMIN", status: "ACTIVE" }),
        apiService.getUsers({ limit: 1, role: "BUSINESS_ADMIN", status: "INACTIVE" }),
        apiService.getVehicles({}),
        apiService.getVehicles({ status: "VERIFIED" }),
        apiService.getVehicles({ status: "PENDING" }),
        apiService.getTransactions2({ limit: 1, entityId: wallet?.entityId, type: "CREDIT", status: "SUCCESS" }),
        apiService.getTransactions2({ limit: 1, entityId: wallet?.entityId, type: "DEBIT", status: "SUCCESS" }),
      ]);

      return {
        balance: wallet?.balance ?? 0,
        currency: wallet?.currency,
        orders: {
          total: total(ordersTotal),
          completed: total(completed),
          cancelled: total(cancelled),
          ongoing: total(ongoing),
          pending: total(pending),
        },
        types: { single: total(single), batch: total(batch), bulk: total(bulk) },
        people: {
          customers: total(customers),
          activeCustomers: total(activeCustomers),
          inactiveCustomers: total(inactiveCustomers),
          riders: total(riders),
          activeRiders: total(activeRiders),
          inactiveRiders: total(inactiveRiders),
          businesses: total(businesses),
          activeBusinesses: total(activeBusinesses),
          inactiveBusinesses: total(inactiveBusinesses),
        },
        fleet: { vehicles: total(vehicles), verified: total(verified), pending: total(pendingVeh) },
        money: { creditTxns: total(credits), debitTxns: total(debits) },
      };
    },
  });

export type DayPoint = {
  day: string;
  label: string;
  orders: number;
  paid: number;
  revenue: number;
  single: number;
  batch: number;
  bulk: number;
  completed: number;
  cancelled: number;
};

/**
 * Orders + paid-order value per day for the last `days`. One windowed fetch
 * (capped at 3000 records) bucketed by createdAt. Revenue is in base units.
 */
export const useGetOrdersTimeseriesQuery = (days = 30) =>
  useQuery({
    queryKey: [ANALYTICS_KEY, "orders-timeseries", days],
    queryFn: async (): Promise<DayPoint[]> => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));

      const res = await apiService.getOrders({
        dateRange: `${fmt(start)},${fmt(end)}`,
        limit: 3000,
        order: "DESC",
      });

      const buckets = new Map<string, DayPoint>();
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        buckets.set(fmt(d), {
          day: fmt(d),
          label: dayLabel(d),
          orders: 0,
          paid: 0,
          revenue: 0,
          single: 0,
          batch: 0,
          bulk: 0,
          completed: 0,
          cancelled: 0,
        });
      }

      for (const order of res.results ?? []) {
        const key = (order.createdAt || "").slice(0, 10);
        const bucket = buckets.get(key);
        if (!bucket) continue;
        bucket.orders += 1;
        if (order.paymentStatus === "PAID") {
          bucket.paid += 1;
          bucket.revenue += subUnitToBaseUnit(order.totalAmountPayable ?? 0);
        }
        if (order.type === "SINGLE") bucket.single += 1;
        else if (order.type === "BATCH") bucket.batch += 1;
        else if (order.type === "BULK") bucket.bulk += 1;
        if (order.status === "COMPLETED") bucket.completed += 1;
        else if (order.status === "CANCELLED") bucket.cancelled += 1;
      }

      return Array.from(buckets.values());
    },
  });

/** Live operational snapshot — what's happening on the app right now. */
export const useGetLiveOpsQuery = () =>
  useQuery({
    queryKey: [ANALYTICS_KEY, "live-ops"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const today = fmt(new Date());
      const [ongoing, accepted, awaiting, cancelledToday] = await Promise.all([
        apiService.getOrders({ limit: 1, status: "ON_GOING" }),
        apiService.getOrders({ limit: 1, status: "ACCEPTED" }),
        apiService.getOrders({ limit: 1, status: "INITIATED" }),
        apiService.getOrders({ limit: 1, status: "CANCELLED", dateRange: `${today},${today}` }),
      ]);
      return {
        ongoing: total(ongoing),
        accepted: total(accepted),
        awaiting: total(awaiting),
        cancelledToday: total(cancelledToday),
      };
    },
  });

/** Most recent orders across the platform — a live feed. */
export const useGetRecentOrdersFeedQuery = (limit = 8) =>
  useQuery({
    queryKey: [ANALYTICS_KEY, "recent-orders", limit],
    refetchInterval: 30_000,
    queryFn: () => apiService.getOrders({ limit, order: "DESC" }),
  });

const TXN_CATEGORIES = ["FEE", "DEPOSIT", "WITHDRAWAL", "REVERSAL", "CHARGE"] as const;

/** Successful-transaction counts per category over the window — for a pie. */
export const useGetTransactionMixQuery = (days = 30) =>
  useQuery({
    queryKey: [ANALYTICS_KEY, "txn-mix", days],
    queryFn: async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      const dateRange = `${fmt(start)},${fmt(end)}`;

      const counts = await Promise.all(
        TXN_CATEGORIES.map((category) =>
          apiService.getTransactions2({ dateRange, category, status: "SUCCESS", limit: 1 }),
        ),
      );

      return TXN_CATEGORIES.map((category, i) => ({ category, count: total(counts[i]) })).filter((c) => c.count > 0);
    },
  });

/** New-signup counts per day (customers vs riders) over the window. */
export const useGetUserGrowthQuery = (days = 30) =>
  useQuery({
    queryKey: [ANALYTICS_KEY, "user-growth", days],
    queryFn: async () => {
      const res = await apiService.getUsers({ limit: 1000, order: "DESC" });

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));

      const buckets = new Map<string, { day: string; label: string; customers: number; riders: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        buckets.set(fmt(d), { day: fmt(d), label: dayLabel(d), customers: 0, riders: 0 });
      }

      for (const user of res.results ?? []) {
        const key = (user.createdAt || "").slice(0, 10);
        const bucket = buckets.get(key);
        if (!bucket) continue;
        if (user.isRider) bucket.riders += 1;
        else bucket.customers += 1;
      }

      return Array.from(buckets.values());
    },
  });
