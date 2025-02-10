import { UI } from "@/components/ui";

export const FilterByType = () => {
  return (
    <div className="flex items-center gap-x-7">
      <div>
        <label
          htmlFor="TYPE"
          className="text-primary-gray text-xs font-montserrat font-semibold"
        >
          TYPE
        </label>
        <UI.Select defaultValue="all">
          <UI.SelectTrigger id="TYPE" className="w-[6rem]">
            <UI.SelectValue />
          </UI.SelectTrigger>
          <UI.SelectContent>
            <UI.SelectGroup>
              <UI.SelectItem value="all">All</UI.SelectItem>
              <UI.SelectItem value="Credit">Credit</UI.SelectItem>
              <UI.SelectItem value="Withdrawal">Withdrawal</UI.SelectItem>
              <UI.SelectItem value="Payout">Payout</UI.SelectItem>
            </UI.SelectGroup>
          </UI.SelectContent>
        </UI.Select>
      </div>
      <div>
        <label
          htmlFor="Timeframe"
          className="text-primary-gray text-xs font-montserrat font-semibold"
        >
          Timeframe
        </label>
        <UI.Select defaultValue="all">
          <UI.SelectTrigger id="Timeframe" className="w-[6rem]">
            <UI.SelectValue />
          </UI.SelectTrigger>
          <UI.SelectContent>
            <UI.SelectGroup>
              <UI.SelectItem value="all">All</UI.SelectItem>
              <UI.SelectItem value="Today">Today</UI.SelectItem>
              <UI.SelectItem value="Last 7 days">Last 7 days</UI.SelectItem>
              <UI.SelectItem value="This month">This month</UI.SelectItem>
            </UI.SelectGroup>
          </UI.SelectContent>
        </UI.Select>
      </div>
    </div>
  );
};
