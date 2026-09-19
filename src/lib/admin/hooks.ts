"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { errorMessage } from "./http";
import { achievements, admin, adminLogs, announcements, businesses, coupons, deliveryPrice, finance, issues, me, messaging, orders, reviews, settings, stats, transactions, users, vehicles, type Query, type RangeQuery } from "./api";

/**
 * Query hooks for the admin. Lists keep the previous page on screen while the
 * next loads; stats refetch every 20s as the fallback for the socket feed.
 */
export const POLL_MS = 20_000;

/** Lists keep the previous page on screen while the next one loads. */
const keep = { placeholderData: keepPreviousData } as const;

// Stats
export const useOverview = (range: RangeQuery) => useQuery({ queryKey: ["stats", "overview", range], queryFn: () => stats.overview(range), refetchInterval: POLL_MS, placeholderData: keepPreviousData });
export const useSeries = (range: RangeQuery & { bucket?: string; riderId?: string; userId?: string }, enabled = true) =>
  useQuery({ queryKey: ["stats", "series", range], queryFn: () => stats.series(range), placeholderData: keepPreviousData, enabled });
export const useTopRiders = (range: RangeQuery & { limit?: number }) => useQuery({ queryKey: ["stats", "top-riders", range], queryFn: () => stats.topRiders(range), placeholderData: keepPreviousData });
export const usePeakHours = (range: RangeQuery) => useQuery({ queryKey: ["stats", "peak-hours", range], queryFn: () => stats.peakHours(range), placeholderData: keepPreviousData });
export const useCharges = (range: RangeQuery) => useQuery({ queryKey: ["stats", "charges", range], queryFn: () => stats.charges(range), placeholderData: keepPreviousData });
export const useRiderCharges = (query: Query) => useQuery({ queryKey: ["stats", "charges-riders", query], queryFn: () => stats.chargesByRider(query), ...keep });
export const useAttention = () => useQuery({ queryKey: ["stats", "attention"], queryFn: stats.attention, refetchInterval: POLL_MS });
export const useUserOverview = (userId: string, range: RangeQuery) =>
  useQuery({ queryKey: ["stats", "user-overview", userId, range], queryFn: () => stats.userOverview(userId, range), placeholderData: keepPreviousData, enabled: Boolean(userId) });

// Me
/**
 * Marks an attention signal as looked at by this admin the moment the screen
 * that shows it opens, so its badge drops to zero until something new lands.
 */
export function useMarkSeen(key: "messagingFailures" | "transactionFailures", enabled = true) {
  const client = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    me.updatePreferences({ seen: { [key]: new Date().toISOString() } })
      .then(() => {
        if (!cancelled) void client.invalidateQueries({ queryKey: ["stats", "attention"] });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [key, enabled, client]);
}
export const useMe = () => useQuery({ queryKey: ["me"], queryFn: me.get, staleTime: 5 * 60_000 });

// Lists
export const useCustomersOverview = (range: RangeQuery & { bucket?: string }) =>
  useQuery({ queryKey: ["stats", "customers-overview", range], queryFn: () => stats.customersOverview(range), refetchInterval: POLL_MS, placeholderData: keepPreviousData });
export const useCustomers = (query: Query) => useQuery({ queryKey: ["customers", query], queryFn: () => stats.customers(query), ...keep });
export const useBusinesses = (query: Query) => useQuery({ queryKey: ["businesses", query], queryFn: () => stats.businesses(query), ...keep });
export const useUsers = (query: Query, enabled = true) => useQuery({ queryKey: ["users", query], queryFn: () => users.list(query), ...keep, enabled });
export const useUser = (userId: string) => useQuery({ queryKey: ["user", userId], queryFn: () => users.get(userId), enabled: Boolean(userId) });
export const useRefundableOrders = (userId: string, enabled = true, search = "") =>
  useQuery({ queryKey: ["user", userId, "refundable-orders", search], queryFn: () => users.refundableOrders(userId, search || undefined), enabled: Boolean(userId) && enabled, ...keep });
export const useUserWallets = (userId: string) => useQuery({ queryKey: ["user-wallets", userId], queryFn: () => users.wallets(userId), enabled: Boolean(userId) });
export const useOrders = (query: Query, options?: { poll?: boolean; enabled?: boolean }) =>
  useQuery({ queryKey: ["orders", query], queryFn: () => orders.list(query), ...keep, refetchInterval: options?.poll ? POLL_MS : false, enabled: options?.enabled ?? true });
export const useOrder = (orderId: string) => useQuery({ queryKey: ["order", orderId], queryFn: () => orders.get(orderId), enabled: Boolean(orderId), refetchInterval: POLL_MS });
export const useOrderOffers = (orderId: string) => useQuery({ queryKey: ["order-offers", orderId], queryFn: () => orders.offers(orderId), enabled: Boolean(orderId) });
/** One order for a summary chip; no polling, unlike useOrder on the detail page. */
export const useOrderSummary = (orderId: string) =>
  useQuery({ queryKey: ["order-summary", orderId], queryFn: () => orders.get(orderId), enabled: Boolean(orderId), staleTime: 5 * 60_000 });
/**
 * A rider's reviews, newest first, with the customer and order expanded so no
 * lookup is needed per row. One request for the latest 200 so rating filters
 * and sorting are instant; riders rarely have more than that.
 */
export const REVIEWS_FETCH_LIMIT = 200;
export const useRiderReviews = (riderId: string, enabled = true) =>
  useQuery({
    queryKey: ["reviews", "rider", riderId],
    queryFn: () => reviews.list({ riderId, limit: REVIEWS_FETCH_LIMIT, order: "DESC", expand: 1 }),
    enabled: enabled && Boolean(riderId),
    staleTime: 60_000,
  });
export const useTransactions = (query: Query, enabled = true) => useQuery({ queryKey: ["transactions", query], queryFn: () => transactions.list(query), ...keep, enabled });
export const useTransaction = (id: string) => useQuery({ queryKey: ["transaction", id], queryFn: () => transactions.get(id), enabled: Boolean(id) });
export const useTransactionSummary = (query?: Query) => useQuery({ queryKey: ["transactions", "summary", query], queryFn: () => transactions.summary(query), placeholderData: keepPreviousData });
export const useExternalPayments = (query?: Query) => useQuery({ queryKey: ["transactions", "external", query], queryFn: () => transactions.externalPayments(query), placeholderData: keepPreviousData });
export const useVehicles = (query: Query) => useQuery({ queryKey: ["vehicles", query], queryFn: () => vehicles.list(query), ...keep });
export const useVehicle = (id: string) => useQuery({ queryKey: ["vehicle", id], queryFn: () => vehicles.get(id), enabled: Boolean(id) });

// Business detail
export const useBusiness = (id: string) => useQuery({ queryKey: ["business", id], queryFn: () => businesses.get(id), enabled: Boolean(id) });
export const useBusinessOrders = (id: string, query: Query) => useQuery({ queryKey: ["business", id, "orders", query], queryFn: () => businesses.orders(id, query), ...keep, enabled: Boolean(id) });
export const useBusinessUsers = (id: string, query: Query) => useQuery({ queryKey: ["business", id, "users", query], queryFn: () => businesses.users(id, query), ...keep, enabled: Boolean(id) });
export const useBusinessVehicles = (id: string, query: Query) => useQuery({ queryKey: ["business", id, "vehicles", query], queryFn: () => businesses.vehicles(id, query), ...keep, enabled: Boolean(id) });
export const useBusinessTransactions = (id: string, query: Query) => useQuery({ queryKey: ["business", id, "transactions", query], queryFn: () => businesses.transactions(id, query), ...keep, enabled: Boolean(id) });
export const useBusinessWallets = (id: string) => useQuery({ queryKey: ["business", id, "wallets"], queryFn: () => businesses.wallets(id), enabled: Boolean(id) });

// Finance
export const usePlatformWallet = () => useQuery({ queryKey: ["finance", "platform-wallet"], queryFn: finance.platformWallet, refetchInterval: POLL_MS });
export const useFinanceStatus = () => useQuery({ queryKey: ["finance", "status"], queryFn: finance.status });
export const useBanks = (enabled = true) => useQuery({ queryKey: ["finance", "banks"], queryFn: finance.banks, staleTime: 60 * 60_000, enabled });

// Messaging
export const useBroadcasts = (query: Query) => useQuery({ queryKey: ["broadcasts", query], queryFn: () => messaging.broadcasts(query), ...keep, refetchInterval: POLL_MS });
export const useBroadcast = (id: string) => useQuery({ queryKey: ["broadcast", id], queryFn: () => messaging.broadcast(id), enabled: Boolean(id), refetchInterval: 5_000 });
export const useNotificationLog = (query: Query) => useQuery({ queryKey: ["notification-log", query], queryFn: () => messaging.log(query), ...keep });

// Admin
export const useTeams = (query: Query) => useQuery({ queryKey: ["teams", query], queryFn: () => admin.teams(query), ...keep });
export const useAuditLogs = (query: Query) => useQuery({ queryKey: ["audit-logs", query], queryFn: () => admin.auditLogs(query), ...keep });
export const useDataLogs = (query: Query) => useQuery({ queryKey: ["data-logs", query], queryFn: () => admin.dataLogs(query), ...keep });
export const useCountries = () => useQuery({ queryKey: ["settings", "countries"], queryFn: settings.countries });
export const useCountry = (id: string) => useQuery({ queryKey: ["settings", "country", id], queryFn: () => settings.country(id), enabled: Boolean(id) });
export const useStates = (countryId: string) => useQuery({ queryKey: ["settings", "states", countryId], queryFn: () => settings.states(countryId), enabled: Boolean(countryId) });
export const useDeliveryPricing = () => useQuery({ queryKey: ["settings", "delivery-pricing"], queryFn: settings.deliveryPricing });
export const useDeliveryPriceConfig = () => useQuery({ queryKey: ["delivery-price", "config"], queryFn: deliveryPrice.config });
export const useDeliveryPriceAnalytics = (query?: Query) => useQuery({ queryKey: ["delivery-price", "analytics", query], queryFn: () => deliveryPrice.analytics(query), placeholderData: keepPreviousData });

/**
 * Mutation with toast + invalidation baked in, so every action in the admin
 * behaves the same: optimistic message, error text from the API, refresh of
 * the queries it touched.
 */
export function useAction<TVars, TData = unknown>(
  fn: (vars: TVars) => Promise<TData>,
  options: { success?: string | ((data: TData, vars: TVars) => string); invalidate?: (string | unknown[])[]; onSuccess?: (data: TData, vars: TVars) => void } = {},
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      const message = typeof options.success === "function" ? options.success(data, vars) : options.success;
      if (message) toast.success(message);
      for (const key of options.invalidate ?? []) void client.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      options.onSuccess?.(data, vars);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

// Business detail (typed rollup)
export const useBusinessOrderStatistics = (id: string) =>
  useQuery({
    queryKey: ["business", id, "order-statistics"],
    queryFn: async () => (await businesses.orderStatistics(id)) as unknown as import("./api").BusinessOrderStatistics,
    enabled: Boolean(id),
  });

// Admin section (typed rows)
export const useAuditLogRows = (query: Query) => useQuery({ queryKey: ["audit-logs", query], queryFn: () => adminLogs.auditLogs(query), ...keep });
export const useDataLogRows = (query: Query) => useQuery({ queryKey: ["data-logs", query], queryFn: () => adminLogs.dataLogs(query), ...keep });

// Messaging: live reach estimate while composing, and a detail poll that stops once a broadcast has finished.
export const useBroadcastEstimate = (body: Parameters<typeof messaging.estimate>[0], enabled = true) =>
  useQuery({ queryKey: ["broadcast-estimate", body], queryFn: () => messaging.estimate(body), enabled, placeholderData: keepPreviousData, retry: false });
export const useBroadcastLive = (id: string, running: boolean) =>
  useQuery({ queryKey: ["broadcast", id], queryFn: () => messaging.broadcast(id), enabled: Boolean(id), refetchInterval: running ? 3_000 : false });

// Coupons
export const useCoupons = (query: Query) => useQuery({ queryKey: ["coupons", query], queryFn: () => coupons.list(query), ...keep });
export const useCouponsSummary = (range?: RangeQuery) => useQuery({ queryKey: ["coupons", "summary", range], queryFn: () => coupons.summary(range), refetchInterval: POLL_MS, placeholderData: keepPreviousData });
export const useCoupon = (id: string) => useQuery({ queryKey: ["coupon", id], queryFn: () => coupons.get(id), enabled: Boolean(id) });
export const useCouponUsages = (id: string, query: Query) => useQuery({ queryKey: ["coupon", id, "usages", query], queryFn: () => coupons.usages(id, query), ...keep, enabled: Boolean(id) });
export const useCouponGroups = (query: Query) => useQuery({ queryKey: ["coupon-groups", query], queryFn: () => coupons.groups(query), ...keep });
export const useCouponGroup = (id: string) => useQuery({ queryKey: ["coupon-group", id], queryFn: () => coupons.group(id), enabled: Boolean(id) });

// Achievements
export const useAchievementCatalogue = () => useQuery({ queryKey: ["achievements", "catalogue"], queryFn: achievements.catalogue, refetchInterval: POLL_MS });
export const useAchievementsSummary = (range?: RangeQuery) => useQuery({ queryKey: ["achievements", "summary", range], queryFn: () => achievements.summary(range), refetchInterval: POLL_MS, placeholderData: keepPreviousData });
export const useAchievementUnlocks = (query: Query) => useQuery({ queryKey: ["achievements", "unlocks", query], queryFn: () => achievements.unlocks(query), ...keep });
export const useCustomerAchievements = (userId: string, enabled = true) =>
  useQuery({ queryKey: ["achievements", "user", userId], queryFn: () => achievements.forUser(userId), enabled: Boolean(userId) && enabled });

// Support (issue reports)
export const useIssues = (query: Query) => useQuery({ queryKey: ["issues", query], queryFn: () => issues.list(query), ...keep, refetchInterval: POLL_MS });
export const useIssuesSummary = (range?: RangeQuery) => useQuery({ queryKey: ["issues", "summary", range], queryFn: () => issues.summary(range), refetchInterval: POLL_MS, placeholderData: keepPreviousData });
export const useIssue = (id: string) => useQuery({ queryKey: ["issue", id], queryFn: () => issues.get(id), enabled: Boolean(id) });
export const useUserIssues = (userId: string, query: Query, enabled = true) =>
  useQuery({ queryKey: ["issues", "user", userId, query], queryFn: () => issues.forUser(userId, query), ...keep, enabled: Boolean(userId) && enabled });

// In-app announcements
export const useAnnouncements = (query: Query) => useQuery({ queryKey: ["announcements", query], queryFn: () => announcements.list(query), ...keep });
export const useAnnouncement = (announcementId: string) =>
  useQuery({ queryKey: ["announcement", announcementId], queryFn: () => announcements.get(announcementId), enabled: Boolean(announcementId), refetchInterval: POLL_MS });
export const useAnnouncementsSummary = () => useQuery({ queryKey: ["announcements", "summary"], queryFn: announcements.summary, refetchInterval: POLL_MS });
export const useAnnouncementScreens = () => useQuery({ queryKey: ["announcements", "screens"], queryFn: announcements.screens, staleTime: 60 * 60_000 });
export const useAnnouncementReceipts = (announcementId: string, query: Query) =>
  useQuery({ queryKey: ["announcement", announcementId, "receipts", query], queryFn: () => announcements.receipts(announcementId, query), enabled: Boolean(announcementId), ...keep });
