"use client";

import { SVG } from "@/components/svg";
import { useGetPlatformWalletQuery } from "@/api/queries";
import { useGetTransactionsCountQuery } from "@/api/queries/transaction";
import { formatMoney, subUnitToBaseUnit } from "@/utils";

export const StatsContainer = () => {
  const { data: platformWallet } = useGetPlatformWalletQuery();
  // No aggregate endpoint exists yet, so the tiles show successful transaction
  // counts for the platform wallet rather than fake money totals.
  const { data: credits } = useGetTransactionsCountQuery(
    { entityId: platformWallet?.entityId, type: "CREDIT", status: "SUCCESS" },
    !!platformWallet?.entityId,
  );
  const { data: debits } = useGetTransactionsCountQuery(
    { entityId: platformWallet?.entityId, type: "DEBIT", status: "SUCCESS" },
    !!platformWallet?.entityId,
  );

  return (
    <div className="flex md:flex-row flex-col md:items-center gap-2">
      <div className="md:max-w-[32rem] w-full overflow-hidden   text-white  group border  flex flex-col justify-between px-6 py-4 h-[130px] bg-primary-black relative rounded-lg">
        <span className="size-[2rem] bg-[#ffffff13] grid place-items-center rounded-lg">
          <SVG.BalanceIcon />
        </span>
        <span className="font-semibold font-clash-display ">Current Balance</span>
        <span className="font-semibold font-clash-display text-xl">
          {formatMoney(subUnitToBaseUnit(platformWallet?.balance ?? 0), { currency: platformWallet?.currency })}
        </span>
        <div className="absolute opacity-55  right-0 top-0 transition-all duration-700 ease-in group-hover:translate-y-[-25px] group-hover:translate-x-[-25px] ">
          <SVG.SvgCardBgPattern />
        </div>
      </div>
      <div className="rounded-lg bg-[#DEF4F2] py-4 flex-1 px-4 h-[130px]">
        <div>
          <span className="font-montserrat text-sm text-primary-gray dark:text-stone-950 font-semibold">
            Total Revenue (successful credits)
          </span>
          <div className="flex mt-2 items-center gap-x-5">
            <div className="h-[2.1rem] w-[4px] rounded-2xl bg-[#32BA7C]" />
            <span className="font-semibold font-clash-display  dark:text-stone-950 text-2xl">
              {credits?.totalRecords ?? 0} txns
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-[#FF52441F] flex-1 py-4 px-4 h-[130px]">
        <div>
          <span className="font-montserrat text-sm text-primary-gray font-semibold">
            Total Expenditure (successful debits)
          </span>
          <div className="flex mt-2 items-center gap-x-5">
            <div className="h-[2.1rem] w-[4px] rounded-2xl bg-[#FF5244]" />
            <span className="font-semibold font-clash-display text-2xl">{debits?.totalRecords ?? 0} txns</span>
          </div>
        </div>
      </div>
    </div>
  );
};
