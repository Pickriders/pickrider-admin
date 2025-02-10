import { SecondaryCard } from "../StatsCard/SecondaryCard";
import { SVG } from "@/components/svg";
import { PrimaryStatsCard } from "../StatsCard/PrimaryCard";

export const StatsContainer = () => {
  return (
    <div className="mt-[1.5rem] grid grid-cols-3 gap-6">
      <SecondaryCard
        icon={<SVG.BalanceIcon />}
        title="Current Balance"
        value="$0"
      />
      <PrimaryStatsCard variant="positive" title="Total Revenue" value="$0" />
      <PrimaryStatsCard
        variant="negative"
        title="Total Expenditure"
        value="$0"
      />
      <PrimaryStatsCard
        variant="neutral"
        title="Single Order Earnings"
        value="$0"
      />
      <PrimaryStatsCard
        variant="neutral"
        title="Batch Delivery Earnings"
        value="$0"
      />
      <PrimaryStatsCard
        variant="neutral"
        title="Bulk Pickup Earnings"
        value="$0"
      />
      <PrimaryStatsCard variant="neutral" title="Single Order" value="0" />
      <PrimaryStatsCard variant="neutral" title="Batch Delivery" value="0" />
      <PrimaryStatsCard variant="neutral" title="Bulk Pickup" value="0" />
      <SecondaryCard
        icon={<SVG.PersonGroupBoldFillIcon />}
        title="Customers"
        value="0"
      />
      <PrimaryStatsCard variant="positive" title="Active Customers" value="0" />
      <PrimaryStatsCard
        variant="negative"
        title="Inactive Customers"
        value="0"
      />
      <SecondaryCard
        icon={<SVG.PeopleGroupFill />}
        title="Business"
        value="0"
      />
      <PrimaryStatsCard
        variant="positive"
        title="Verified Business"
        value="0"
      />
      <PrimaryStatsCard
        variant="negative"
        title="Unverified Business"
        value="0"
      />
      <SecondaryCard
        icon={<SVG.PersonAcceptFillIcon />}
        title="Couriers"
        value="0"
      />
      <PrimaryStatsCard variant="positive" title="Active Courier" value="0" />
      <PrimaryStatsCard variant="negative" title="Inactive Courier" value="0" />
    </div>
  );
};
