import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { apiService } from "@/services";
import { STORAGE } from "@/constant";

const authHeader = () => ({
  Authorization: `Bearer ${getCookie(STORAGE.accessToken)?.toString()}`,
});

/**
 * Delivery-price calculator analytics. The endpoint is a fresh core route not in
 * the generated Api client, so we call it directly on the shared axios instance
 * and attach the admin token from the cookie.
 */
export const DELIVERY_PRICE_KEY = "delivery-price-analytics";

export type DeliveryPriceAnalytics = {
  range: { from: string; to: string };
  currentFuelPrice: number;
  quotes: {
    total: number;
    batchRate: number;
    avgDistanceKm: number;
    avgPrice: number;
    perDay: { date: string; count: number; fuel: number }[];
    distanceBands: { band: string; count: number }[];
    topPickups: { area: string; count: number }[];
    topDropoffs: { area: string; count: number }[];
  };
  engagement: {
    share: number;
    copy: number;
    book: number;
    shareRate: number;
    bookRate: number;
  };
  feedback: {
    total: number;
    verdicts: { too_low: number; fair: number; too_high: number };
    bySegment: { _id: { segment: string; verdict: string }; count: number }[];
    byBand: { _id: { band: string; verdict: string }; count: number }[];
    medianSuggestedByBand: { band: string; median: number; count: number }[];
  };
};

export const useDeliveryPriceAnalyticsQuery = (days: number) =>
  useQuery({
    queryKey: [DELIVERY_PRICE_KEY, days],
    queryFn: async (): Promise<DeliveryPriceAnalytics> => {
      const to = new Date();
      const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
      const res = await apiService.instance.get(
        "/api/v1/delivery-price/admin/analytics",
        {
          params: { from: from.toISOString(), to: to.toISOString() },
          headers: authHeader(),
        },
      );
      return res.data;
    },
  });

export type DeliveryCalcConfig = {
  maxExtraStops: number;
  staleDays: number;
  batchDiscountPercent: number;
  corePricing?: { pricePerKm: number; minimum: number; fuelPrice: number };
};

const CONFIG_KEY = "delivery-price-config";

export const useDeliveryCalcConfigQuery = () =>
  useQuery({
    queryKey: [CONFIG_KEY],
    queryFn: async (): Promise<DeliveryCalcConfig> => {
      const res = await apiService.instance.get(
        "/api/v1/delivery-price/admin/config",
        { headers: authHeader() },
      );
      return res.data;
    },
  });

export const useUpdateDeliveryCalcConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<DeliveryCalcConfig>) => {
      const res = await apiService.instance.patch(
        "/api/v1/delivery-price/admin/config",
        patch,
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CONFIG_KEY] }),
  });
};
