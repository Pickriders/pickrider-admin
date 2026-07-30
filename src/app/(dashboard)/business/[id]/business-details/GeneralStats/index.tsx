"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useGetBusinessOrderStatisticsQuery, useGetBusinessQuery } from "@/api/queries/business";

export const GeneralStats = ({ businessId }: { businessId: string }) => {
  const { data: business } = useGetBusinessQuery(businessId);
  const { data: stats } = useGetBusinessOrderStatisticsQuery(businessId);

  return (
    <div className="font-montserrat">
      <UI.SectionHeader text=" GENERAL STATS" />

      <div className="mt-5  grid grid-cols-2 gap-x-14 gap-y-8 w-[19rem] ">
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Vehicles</h4>
          <p className="font-semibold flex items-center justify-between text-primary-purple text-xs">
            {business?.vehicles?.length ?? 0}
            <SVG.MoveUpRightArrowIcon width={13} height={13} />
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Team Members</h4>
          <p className="font-semibold flex items-center justify-between text-primary-purple text-xs">
            {business?.users?.length ?? 0}
            <SVG.MoveUpRightArrowIcon width={13} height={13} />
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Completed orders</h4>
          <p className="font-semibold text-primary-purple text-xs">{stats?.completed ?? 0}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Cancelled orders</h4>
          <p className="font-semibold text-primary-purple text-xs">{stats?.cancelled ?? 0}</p>
        </div>
      </div>
    </div>
  );
};
