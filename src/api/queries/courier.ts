import { useQuery } from "@tanstack/react-query";
import { apiService, GetOrdersParams } from "@/services";

/**
 * Courier (rider) deliveries. The admin orders endpoint filters by rider via
 * `riderId` (handled in the backend buildQuery) even though it isn't in the
 * generated params type — hence the cast.
 */
export const COURIER_KEY = { ROOT: "courier" };

const deliveries = (riderId?: string, extra: Record<string, unknown> = {}) =>
  apiService.getOrders({ riderId, ...extra } as unknown as GetOrdersParams);

export const useGetCourierDeliveryStatsQuery = (riderId?: string) =>
  useQuery({
    queryKey: [COURIER_KEY.ROOT, riderId, "delivery-stats"],
    queryFn: async () => {
      const [total, completed, cancelled] = await Promise.all([
        deliveries(riderId, { limit: 1 }),
        deliveries(riderId, { status: "COMPLETED", limit: 1 }),
        deliveries(riderId, { status: "CANCELLED", limit: 1 }),
      ]);
      return {
        total: total?.totalRecords ?? 0,
        completed: completed?.totalRecords ?? 0,
        cancelled: cancelled?.totalRecords ?? 0,
      };
    },
    enabled: !!riderId,
    retry: false,
  });

export const useGetCourierDeliveriesQuery = (riderId?: string, page = 1, limit = 8) =>
  useQuery({
    queryKey: [COURIER_KEY.ROOT, riderId, "deliveries", page, limit],
    queryFn: () => deliveries(riderId, { page, limit, order: "DESC" }),
    enabled: !!riderId,
    retry: false,
  });

export const useGetCourierCompletedCountQuery = (riderId?: string) =>
  useQuery({
    queryKey: [COURIER_KEY.ROOT, riderId, "completed"],
    queryFn: async () => (await deliveries(riderId, { status: "COMPLETED", limit: 1 }))?.totalRecords ?? 0,
    enabled: !!riderId,
    retry: false,
  });
