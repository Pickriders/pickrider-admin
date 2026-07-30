"use client";

import { useGetPlatformWalletQuery } from "@/api/queries";
import { formatMoney, subUnitToBaseUnit } from "@/utils";

/** Real platform-wallet balance, formatted. */
export const PlatformBalance = () => {
  const { data: platformWallet } = useGetPlatformWalletQuery();
  return (
    <span className="text-[#1E1F1F] dark:text-white">
      {formatMoney(subUnitToBaseUnit(platformWallet?.balance ?? 0), { currency: platformWallet?.currency })}
    </span>
  );
};
