"use client";

import { useGetBusinessQuery, useGetBusinessWalletsQuery } from "@/api/queries/business";
import { formatMoney, subUnitToBaseUnit } from "@/utils";

export const BusinessBalance = ({ businessId }: { businessId: string }) => {
  const { data: business } = useGetBusinessQuery(businessId);
  const { data: wallets } = useGetBusinessWalletsQuery(businessId);
  const wallet = wallets?.results?.[0];

  return (
    <div className="flex items-center gap-x-3">
      <div className="w-[9.7rem] h-[4.4rem] bg-accent rounded-lg p-3.5">
        <p className="truncate font-semibold text-xs font-montserrat">{business?.email ?? "—"}</p>
        <h4 className="font-clash-display mt-2 font-semibold text-primary-purple truncate">
          {business?.name ?? "—"}
        </h4>
      </div>

      <div className="w-[7.5rem] h-[4.4rem] p-3.5 bg-accent-foreground rounded-lg text-primary-foreground">
        <p className="text-xs font-montserrat font-semibold">Balance</p>
        <h4 className="font-clash-display mt-2 font-semibold truncate">
          {wallet ? formatMoney(subUnitToBaseUnit(wallet.balance ?? 0), { currency: wallet.currency }) : "N/A"}
        </h4>
      </div>
    </div>
  );
};
