import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

export const WALLET_KEY = {
  PLATFORM_WALLET: "platform_wallet",
};

export const useGetPlatformWalletQuery = () =>
  useApiQuery({
    queryKey: [WALLET_KEY.PLATFORM_WALLET],
    queryFn: () => apiService.getPlatformWallet(),
  });
