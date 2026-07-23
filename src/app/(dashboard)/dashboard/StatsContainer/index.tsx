"use client";

import { SecondaryCard } from "../StatsCard/SecondaryCard";
import { SVG } from "@/components/svg";
import { PrimaryStatsCard } from "../StatsCard/PrimaryCard";
import { useGetPlatformWalletQuery } from "@/api/queries";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { useGetOrdersQuery } from "@/api/queries/orders";
import { useGetUsersQuery } from "@/api/queries/user";
import { useGetTransactionsCountQuery } from "@/api/queries/transaction";

export const StatsContainer = () => {
  const { data: platformWallet } = useGetPlatformWalletQuery();
  // No money-aggregate endpoint exists, so revenue/expenditure show successful
  // transaction counts and the per-type tiles show completed-order counts.
  const { data: credits } = useGetTransactionsCountQuery(
    { entityId: platformWallet?.entityId, type: "CREDIT", status: "SUCCESS" },
    !!platformWallet?.entityId,
  );
  const { data: debits } = useGetTransactionsCountQuery(
    { entityId: platformWallet?.entityId, type: "DEBIT", status: "SUCCESS" },
    !!platformWallet?.entityId,
  );
  const { data: singleCompleted } = useGetOrdersQuery({ limit: 1, type: "SINGLE", status: "COMPLETED" });
  const { data: batchCompleted } = useGetOrdersQuery({ limit: 1, type: "BATCH", status: "COMPLETED" });
  const { data: bulkCompleted } = useGetOrdersQuery({ limit: 1, type: "BULK", status: "COMPLETED" });
  const { data: singleOrders } = useGetOrdersQuery({ limit: 1, type: "SINGLE" });
  const { data: batchOrders } = useGetOrdersQuery({ limit: 1, type: "BATCH" });
  const { data: bulkOrders } = useGetOrdersQuery({ limit: 1, type: "BULK" });
  const { data: allCustomers } = useGetUsersQuery({ limit: 1, isRider: "false" });
  const { data: activeCustomers } = useGetUsersQuery({ limit: 1, status: "ACTIVE", isRider: "false" });
  const { data: inactiveCustomers } = useGetUsersQuery({ limit: 1, status: "INACTIVE", isRider: "false" });
  const { data: allCouriers } = useGetUsersQuery({ limit: 1, isRider: "true" });
  const { data: activeCouriers } = useGetUsersQuery({ limit: 1, isRider: "true", status: "ACTIVE" });
  const { data: inactiveCouriers } = useGetUsersQuery({ limit: 1, isRider: "true", status: "INACTIVE" });
  // Business owners carry BUSINESS_ADMIN (there is no plain BUSINESS role).
  const { data: allBusiness } = useGetUsersQuery({ limit: 1, role: "BUSINESS_ADMIN" });
  const { data: activeBusiness } = useGetUsersQuery({ limit: 1, role: "BUSINESS_ADMIN", status: "ACTIVE" });
  const { data: inactiveBusiness } = useGetUsersQuery({ limit: 1, role: "BUSINESS_ADMIN", status: "INACTIVE" });

  const numberOfSingleOrders = singleOrders?.totalRecords ?? 0;
  const numberOfBatchOrders = batchOrders?.totalRecords ?? 0;
  const numberOfBulkOrders = bulkOrders?.totalRecords ?? 0;
  const numberOfAllCustomers = allCustomers?.totalRecords ?? 0;
  const numberOfActiveCustomers = activeCustomers?.totalRecords ?? 0;
  const numberOfInactiveCustomers = inactiveCustomers?.totalRecords ?? 0;
  const numberOfAllCouriers = allCouriers?.totalRecords ?? 0;
  const numberOfActiveCouriers = activeCouriers?.totalRecords ?? 0;
  const numberOfInactiveCouriers = inactiveCouriers?.totalRecords ?? 0;
  const numberOfAllBusiness = allBusiness?.totalRecords ?? 0;
  const numberOfActiveBusiness = activeBusiness?.totalRecords ?? 0;
  const numberOfInactiveBusiness = inactiveBusiness?.totalRecords ?? 0;

  return (
    <div className="mt-[1.5rem] grid sm:grid-cols-2 xl:grid-cols-3 grid-cols-1 gap-6">
      <SecondaryCard
        icon={<SVG.BalanceIcon />}
        title="Current Balance"
        value={formatMoney(subUnitToBaseUnit(platformWallet?.balance ?? 0), { currency: platformWallet?.currency })}
      />
      <PrimaryStatsCard variant="positive" title="Total Revenue (credit txns)" value={credits?.totalRecords ?? 0} />
      <PrimaryStatsCard variant="negative" title="Total Expenditure (debit txns)" value={debits?.totalRecords ?? 0} />
      <PrimaryStatsCard
        variant="neutral"
        title="Single Orders Completed"
        value={singleCompleted?.totalRecords ?? 0}
      />
      <PrimaryStatsCard variant="neutral" title="Batch Deliveries Completed" value={batchCompleted?.totalRecords ?? 0} />
      <PrimaryStatsCard variant="neutral" title="Bulk Pickups Completed" value={bulkCompleted?.totalRecords ?? 0} />
      <PrimaryStatsCard variant="neutral" title="Single Order" value={numberOfSingleOrders} />
      <PrimaryStatsCard variant="neutral" title="Batch Delivery" value={numberOfBatchOrders} />
      <PrimaryStatsCard variant="neutral" title="Bulk Pickup" value={numberOfBulkOrders} />
      <SecondaryCard icon={<SVG.PersonGroupBoldFillIcon />} title="Customers" value={numberOfAllCustomers} />
      <PrimaryStatsCard variant="positive" title="Active Customers" value={numberOfActiveCustomers} />
      <PrimaryStatsCard variant="negative" title="Inactive Customers" value={numberOfInactiveCustomers} />
      <SecondaryCard icon={<SVG.PeopleGroupFill />} title="Business" value={numberOfAllBusiness} />
      <PrimaryStatsCard variant="positive" title="Verified Business" value={numberOfActiveBusiness} />
      <PrimaryStatsCard variant="negative" title="Unverified Business" value={numberOfInactiveBusiness} />
      <SecondaryCard icon={<SVG.PersonAcceptFillIcon />} title="Couriers" value={numberOfAllCouriers} />
      <PrimaryStatsCard variant="positive" title="Active Courier" value={numberOfActiveCouriers} />
      <PrimaryStatsCard variant="negative" title="Inactive Courier" value={numberOfInactiveCouriers} />
    </div>
  );
};
