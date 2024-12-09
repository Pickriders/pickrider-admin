import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const OrdersTableFilter = () => {
  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-10 p-0 w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">
          Filter Orders
        </h4>
        <div className="py-4 px-3">
          <div className="flex items-center gap-x-10">
            <div>
              <label
                htmlFor="type"
                className="text-primary-gray text-xs font-faktum-test font-semibold"
              >
                Type
              </label>
              <UI.Select defaultValue="all">
                <UI.SelectTrigger id="type" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="Single order">
                      Single order
                    </UI.SelectItem>
                    <UI.SelectItem value="Batch delivery">
                      Batch delivery
                    </UI.SelectItem>
                    <UI.SelectItem value="Bulk pickup">
                      Bulk pickup
                    </UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div>
              <label
                htmlFor="status"
                className="text-primary-gray text-xs font-faktum-test font-semibold"
              >
                Status
              </label>
              <UI.Select defaultValue="all">
                <UI.SelectTrigger id="status" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="Pending">Pending</UI.SelectItem>
                    <UI.SelectItem value="Completed">Completed</UI.SelectItem>
                    <UI.SelectItem value="Canceled">Canceled</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
          </div>
          <div className="flex mt-4 items-center gap-x-10">
            <div>
              <label
                htmlFor="Timeframe"
                className="text-primary-gray text-xs font-faktum-test font-semibold"
              >
                Timeframe
              </label>
              <UI.Select defaultValue="All time">
                <UI.SelectTrigger id="Timeframe" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="All time">All time</UI.SelectItem>
                    <UI.SelectItem value="Today">Today</UI.SelectItem>
                    <UI.SelectItem value="Last 7 days">
                      Last 7 days
                    </UI.SelectItem>
                    <UI.SelectItem value="This month">This month</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div>
              <label
                htmlFor="Courier"
                className="text-primary-gray text-xs font-faktum-test font-semibold"
              >
                Courier
              </label>
              <UI.Select defaultValue="all">
                <UI.SelectTrigger id="Courier" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="Rider">Rider</UI.SelectItem>
                    <UI.SelectItem value="Business">Business</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <UI.Button variant={"ghost"}>Reset Filter</UI.Button>
            <UI.Button>Save Filter</UI.Button>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
