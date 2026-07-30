import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

export const FINANCE_KEY = "finance";

/**
 * Money-flow summary (server-side aggregate) — total processed volume,
 * inflow/outflow and per-category totals. `dateRange` is "YYYY-MM-DD,YYYY-MM-DD";
 * omit it for all-time.
 */
export const useGetFinanceSummaryQuery = (dateRange?: string) =>
  useApiQuery({
    queryKey: [FINANCE_KEY, "summary", dateRange ?? "all"],
    queryFn: () => apiService.getTransactionSummary(dateRange ? { dateRange } : undefined),
  });
