"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useTableUrlFilter } from "@/hooks";

const STATUS = ["INITIATED", "ACCEPTED", "ON_GOING", "COMPLETED", "CANCELLED"];
const ORDER_TYPES = ["SINGLE", "BATCH", "BULK"];

export const OrdersTableFilter = () => {
  const { searchParams, updateFilter } = useTableUrlFilter();
  const FILTER_STATUS = searchParams.get("status") || "ALL";
  const FILTER_ORDER_TYPE = searchParams.get("orderType") || "ALL";

  const filterByOrderType = (filterBy: string) => {
    updateFilter("orderType", filterBy.toUpperCase());
  };

  const filterByStatus = (filterBy: string) => {
    updateFilter("status", filterBy.toUpperCase());
  };

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-2 sm:mr-10 p-0 w-[92vw] sm:w-[19rem] max-w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">Filter Orders</h4>
        <div className="py-4 px-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-x-10">
            <div>
              <label htmlFor="type" className="text-primary-gray text-xs font-faktum-test font-semibold">
                Order Type
              </label>
              <UI.Select onValueChange={filterByOrderType} value={FILTER_ORDER_TYPE}>
                <UI.SelectTrigger id="type" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    {["ALL", ...ORDER_TYPES].map((orderType) => {
                      return (
                        <UI.SelectItem key={orderType} value={orderType}>
                          {orderType}
                        </UI.SelectItem>
                      );
                    })}
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div>
              <label htmlFor="STATUS" className="text-primary-gray text-xs font-faktum-test font-semibold">
                Status
              </label>
              <UI.Select onValueChange={filterByStatus} value={FILTER_STATUS}>
                <UI.SelectTrigger id="STATUS" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    {["ALL", ...STATUS].map((status, i) => {
                      return (
                        <UI.SelectItem key={i} value={status}>
                          {status}
                        </UI.SelectItem>
                      );
                    })}
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
          </div>
          <div className="flex mt-4 flex-wrap items-center gap-4 sm:gap-x-10">
            <div>
              <label htmlFor="Timeframe" className="text-primary-gray text-xs font-faktum-test font-semibold">
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
                    <UI.SelectItem value="Last 7 days">Last 7 days</UI.SelectItem>
                    <UI.SelectItem value="This month">This month</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div>
              <label htmlFor="Courier" className="text-primary-gray text-xs font-faktum-test font-semibold">
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
