import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { apiService, queryClient } from "@/services";
import { toast } from "sonner";

export const FINANCE_OPS_KEY = "finance-ops";

export const useGetFinanceStatusQuery = () =>
  useApiQuery({
    queryKey: [FINANCE_OPS_KEY, "status"],
    queryFn: () => apiService.getFinanceStatus(),
  });

/** Paystack bank list (normalised to { name, code }). */
export const useGetBanksQuery = (enabled = true) =>
  useApiQuery({
    queryKey: [FINANCE_OPS_KEY, "banks"],
    enabled,
    queryFn: async () => {
      const res: any = await apiService.getBanks();
      const list = res?.data ?? res?.results ?? res ?? [];
      return (Array.isArray(list) ? list : []).map((b: any) => ({ name: b.name, code: b.code }));
    },
  });

const invalidate = () => queryClient.invalidateQueries({ queryKey: [FINANCE_OPS_KEY] });

export const useUpdateSettlementMn = () =>
  useApiMutation({
    mutationFn: (data: { accountNumber: string; bankCode: string }) => apiService.updatePlatformSettlement(data),
    onSuccess: () => {
      invalidate();
      toast.success("Settlement account saved");
    },
  });

export const useSetWithdrawalPinMn = () =>
  useApiMutation({
    mutationFn: (data: { pin: string }) => apiService.setWithdrawalPin(data),
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawal PIN set");
    },
  });

export const useInitiatePayoutMn = () =>
  useApiMutation({
    mutationFn: (data: { amount: number; pin: string; reason?: string }) => apiService.initiatePlatformPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCE_OPS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Payout initiated");
    },
  });
