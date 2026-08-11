"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import { useGetBusinessOrderStatisticsQuery, useGetBusinessQuery } from "@/api/queries/business";

export const BusinessStats = ({ businessId }: { businessId: string }) => {
  const { data: business } = useGetBusinessQuery(businessId);
  const { data: stats } = useGetBusinessOrderStatisticsQuery(businessId);

  return (
    <div className="font-montserrat">
      <UI.SectionHeader text="BUSINESS STATS" />
      <div className="mt-5 grid grid-cols-2 gap-x-8 sm:gap-x-14 gap-y-8 w-full sm:w-[19rem] ">
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Phone Number</h4>
          <p className="font-semibold text-primary-purple text-xs">{business?.phone ?? "—"}</p>
        </div>

        <Link href={"orders"} className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Total Orders</h4>
          <p className="font-semibold flex items-center justify-between text-primary-purple text-xs">
            {stats?.total ?? 0}
            <SVG.MoveUpRightArrowIcon width={13} height={13} />
          </p>
        </Link>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Business Type</h4>
          <p className="font-semibold text-primary-purple text-xs">{business?.type ?? "—"}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">State</h4>
          <p className="font-semibold text-primary-purple text-xs">{business?.state?.name ?? "—"}</p>
        </div>
      </div>
    </div>
  );
};
