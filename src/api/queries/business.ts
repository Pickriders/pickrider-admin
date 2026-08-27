import { useQuery } from "@tanstack/react-query";
import { apiService, GetBusinessOrdersParams } from "@/services";

/**
 * Per-business lookups, verified against the core backend guards:
 * - GET /businesses/:id, /wallets, /transactions, /orders, /vehicles,
 *   /order-statistics are guarded with AdminRoles (platform admins allowed).
 * - GET /businesses/:id/users is BUSINESS_ADMIN/BUSINESS_USER only (403 for
 *   platform admins) — do NOT call it here; use business.users ids instead.
 *
 * These use raw useQuery (not useApiQuery) on purpose: a business without a
 * wallet record can 404 and the global handler would take down the whole page
 * via notFound().
 */
export const BUSINESS_KEY = {
  BUSINESS: "business",
};

export const useGetBusinessQuery = (businessId?: string) =>
  useQuery({
    queryKey: [BUSINESS_KEY.BUSINESS, businessId],
    // TODO: api-client drift — regenerate the generated client from the backend swagger.
    // @ts-expect-error stale generated method name; runtime call is unchanged.
    queryFn: () => apiService.getBusinessById({ businessId: businessId! }),
    enabled: !!businessId,
    retry: false,
  });

export const useGetBusinessWalletsQuery = (businessId?: string) =>
  useQuery({
    queryKey: [BUSINESS_KEY.BUSINESS, businessId, "wallets"],
    queryFn: () => apiService.getBusinessWallets({ businessId: businessId! }),
    enabled: !!businessId,
    retry: false,
  });

export const useGetBusinessTransactionsCountQuery = (businessId?: string, type?: string) =>
  useQuery({
    queryKey: [BUSINESS_KEY.BUSINESS, businessId, "transactions-count", type],
    queryFn: () => apiService.getBusinessTransactions({ businessId: businessId!, type, limit: 1 }),
    enabled: !!businessId,
    retry: false,
  });

export const useGetBusinessOrdersQuery = (query: GetBusinessOrdersParams, enabled = true) =>
  useQuery({
    queryKey: [BUSINESS_KEY.BUSINESS, query.businessId, "orders", query],
    queryFn: () => apiService.getBusinessOrders(query),
    enabled: enabled && !!query.businessId,
    retry: false,
  });

export const useGetBusinessOrderStatisticsQuery = (businessId?: string) =>
  useQuery({
    queryKey: [BUSINESS_KEY.BUSINESS, businessId, "order-statistics"],
    queryFn: () => apiService.getBusinessOrderStatistics({ businessId: businessId! }),
    enabled: !!businessId,
    retry: false,
  });
