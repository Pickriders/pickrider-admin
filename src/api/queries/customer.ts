import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services";
import { useApiMutation } from "@/hooks/useApiMutation";
import { queryClient } from "@/services";
import { toast } from "sonner";
import { USER_KEY } from "./user";

/**
 * Per-customer admin data + actions. Reads are derived from the admin list
 * endpoints (transactions by entityId, orders by byUserId) plus the new
 * customer-console endpoints on the core API (wallets, status, adjust, refund).
 */
export const CUSTOMER_KEY = {
  ROOT: "customer",
};

/** Current wallet balance for a customer (first/default wallet). */
export const useGetCustomerWalletQuery = (userId?: string) =>
  useQuery({
    queryKey: [CUSTOMER_KEY.ROOT, userId, "wallet"],
    queryFn: () => apiService.getUserWalletsAdmin({ userId: userId! }),
    enabled: !!userId,
    retry: false,
  });

/** Order counts for a customer: total + completed. */
export const useGetCustomerOrderStatsQuery = (userId?: string) =>
  useQuery({
    queryKey: [CUSTOMER_KEY.ROOT, userId, "order-stats"],
    queryFn: async () => {
      const [total, completed, cancelled] = await Promise.all([
        apiService.getOrders({ byUserId: userId, limit: 1 }),
        apiService.getOrders({ byUserId: userId, status: "COMPLETED", limit: 1 }),
        apiService.getOrders({ byUserId: userId, status: "CANCELLED", limit: 1 }),
      ]);
      return {
        total: total?.totalRecords ?? 0,
        completed: completed?.totalRecords ?? 0,
        cancelled: cancelled?.totalRecords ?? 0,
      };
    },
    enabled: !!userId,
    retry: false,
  });

/**
 * Current balance from the latest transaction's balanceAfter. Uses the
 * existing transactions endpoint, so it works without the new wallet route
 * (handy for the list, where firing the wallet endpoint per row is heavier).
 */
export const useGetCustomerLatestBalanceQuery = (userId?: string) =>
  useQuery({
    queryKey: [CUSTOMER_KEY.ROOT, userId, "latest-balance"],
    queryFn: async () => {
      const res = await apiService.getTransactions2({ entityId: userId, limit: 1, order: "DESC" });
      const latest = res?.results?.[0];
      return { balance: latest?.balanceAfter ?? 0, currency: latest?.currency, hasHistory: !!latest };
    },
    enabled: !!userId,
    retry: false,
  });

export const useGetCustomerCompletedCountQuery = (userId?: string) =>
  useQuery({
    queryKey: [CUSTOMER_KEY.ROOT, userId, "completed-count"],
    queryFn: async () => {
      const res = await apiService.getOrders({ byUserId: userId, status: "COMPLETED", limit: 1 });
      return res?.totalRecords ?? 0;
    },
    enabled: !!userId,
    retry: false,
  });

export const useGetCustomerTransactionsQuery = (userId?: string, page = 1, limit = 8) =>
  useQuery({
    queryKey: [CUSTOMER_KEY.ROOT, userId, "transactions", page, limit],
    queryFn: () => apiService.getTransactions2({ entityId: userId, page, limit, order: "DESC" }),
    enabled: !!userId,
    retry: false,
  });

export const useGetCustomerOrdersQuery = (userId?: string, page = 1, limit = 8) =>
  useQuery({
    queryKey: [CUSTOMER_KEY.ROOT, userId, "orders", page, limit],
    queryFn: () => apiService.getOrders({ byUserId: userId, page, limit, order: "DESC" }),
    enabled: !!userId,
    retry: false,
  });

const invalidateCustomer = (userId: string) => {
  queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY.ROOT, userId] });
  queryClient.invalidateQueries({ queryKey: [USER_KEY.USER, userId] });
  queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
};

export const useUpdateCustomerStatusMn = (userId: string) =>
  useApiMutation({
    mutationFn: (data: { status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED"; reason?: string }) =>
      apiService.updateUserStatus({ userId }, data),
    onSuccess: () => {
      invalidateCustomer(userId);
      toast.success("Customer status updated");
    },
  });

export const useAdjustCustomerWalletMn = (userId: string) =>
  useApiMutation({
    mutationFn: (data: { amount: number; type: "CREDIT" | "DEBIT"; reason: string }) =>
      apiService.adjustUserWallet({ userId }, data),
    onSuccess: () => {
      invalidateCustomer(userId);
      toast.success("Wallet balance adjusted");
    },
  });

export const useRefundCustomerOrderMn = (userId: string) =>
  useApiMutation({
    mutationFn: (data: { orderId: string; amount?: number; reason: string }) =>
      apiService.refundCustomerOrder({ userId }, data),
    onSuccess: () => {
      invalidateCustomer(userId);
      toast.success("Refund issued to customer wallet");
    },
  });
