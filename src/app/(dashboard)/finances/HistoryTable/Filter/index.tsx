"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import React from "react";
import { FilterIcon } from "./Svgs";
import { useURLQuery } from "@/hooks";

export const TableFilter = () => {
  const query = useURLQuery();
  const status = query.get("status");
  const type = query.get("type");
  const category = query.get("category");
  const purpose = query.get("purpose");
  const timeframe = query.get("timeframe");
  const [filter, setFilter] = React.useState({
    type: type || "all",
    category: category || "all",
    purpose: purpose || "all",
    status: status || "all",
    timeframe: timeframe || "all",
  });

  const handleFilter = () => {
    query.setMultiple({
      status: filter.status === "all" ? undefined : filter.status,
      type: filter.type === "all" ? undefined : filter.type,
      category: filter.category === "all" ? undefined : filter.category,
      purpose: filter.purpose === "all" ? undefined : filter.purpose,
      timeframe: filter.timeframe === "all" ? undefined : filter.timeframe,
      page: "1",
    });
  };

  const handleReset = () => {
    query.removeMultiple(["status", "type", "category", "purpose", "timeframe", "page"]);
  };

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"} className="text-primary-gray font-montserrat">
          <FilterIcon />
          Filter
          <SVG.ChevronDown className="fill-primary-gray" />
        </UI.Button>
      </UI.PopoverTrigger>

      {/* Content */}
      <UI.PopoverContent sideOffset={10} side="top" align="start" className="p-0 w-[22rem] overflow-hidden">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">Filter Transactions</h4>
        <div className="py-4 px-3">
          <div className="overflow-hidden transition-[height] duration-300 ease-in-out">
            <div className="flex items-center gap-x-4 gap-y-4 flex-wrap">
              <div>
                <label htmlFor="Type" className="text-primary-gray text-xs font-montserrat font-semibold">
                  Type
                </label>
                <UI.Select
                  defaultValue="all"
                  onValueChange={(value) => setFilter({ ...filter, type: value })}
                  value={filter.type}
                >
                  <UI.SelectTrigger id="Type" className="w-[6rem]">
                    <UI.SelectValue />
                  </UI.SelectTrigger>
                  <UI.SelectContent>
                    <UI.SelectGroup>
                      <UI.SelectItem value="all">All</UI.SelectItem>
                      <UI.SelectItem value="credit">Credit</UI.SelectItem>
                      <UI.SelectItem value="debit">Debit</UI.SelectItem>
                    </UI.SelectGroup>
                  </UI.SelectContent>
                </UI.Select>
              </div>
              <div>
                <label htmlFor="Category" className="text-primary-gray text-xs font-montserrat font-semibold">
                  Category
                </label>
                <UI.Select
                  defaultValue="all"
                  onValueChange={(value) => setFilter({ ...filter, category: value })}
                  value={filter.category}
                >
                  <UI.SelectTrigger id="Category" className="w-[6rem]">
                    <UI.SelectValue />
                  </UI.SelectTrigger>
                  <UI.SelectContent>
                    <UI.SelectGroup>
                      <UI.SelectItem value="all">All</UI.SelectItem>
                      <UI.SelectItem value="fee">Fee</UI.SelectItem>
                      <UI.SelectItem value="deposit">Deposit</UI.SelectItem>
                      <UI.SelectItem value="withdrawal">Withdrawal</UI.SelectItem>
                      <UI.SelectItem value="reversal">Reversal</UI.SelectItem>
                      <UI.SelectItem value="charge">Charge</UI.SelectItem>
                    </UI.SelectGroup>
                  </UI.SelectContent>
                </UI.Select>
              </div>
              <div>
                <label htmlFor="Purpose" className="text-primary-gray text-xs font-montserrat font-semibold">
                  Purpose
                </label>
                <UI.Select
                  defaultValue="all"
                  onValueChange={(value) => setFilter({ ...filter, purpose: value })}
                  value={filter.purpose}
                >
                  <UI.SelectTrigger id="Purpose" className="w-[6rem]">
                    <UI.SelectValue />
                  </UI.SelectTrigger>
                  <UI.SelectContent>
                    <UI.SelectGroup>
                      <UI.SelectItem value="all">All</UI.SelectItem>
                      <UI.SelectItem value="order_earning">Order Earning</UI.SelectItem>
                      <UI.SelectItem value="wallet_funding">Wallet Funding</UI.SelectItem>
                      <UI.SelectItem value="wallet_withdrawal">Wallet Withdrawal</UI.SelectItem>
                      <UI.SelectItem value="referral_bonus">Referral Bonus</UI.SelectItem>
                      <UI.SelectItem value="order_payment">Order Payment</UI.SelectItem>
                      <UI.SelectItem value="order_payment_refund">Order Payment Refund</UI.SelectItem>
                      <UI.SelectItem value="order_earning_split">Order Earning Split</UI.SelectItem>
                      <UI.SelectItem value="order_discount">Order Discount</UI.SelectItem>
                      <UI.SelectItem value="provider_deposit_fee">Provider Deposit Fee</UI.SelectItem>
                      <UI.SelectItem value="provider_withdrawal_fee">Provider Withdrawal Fee</UI.SelectItem>
                      <UI.SelectItem value="order_service_charge">Order Service Charge</UI.SelectItem>
                    </UI.SelectGroup>
                  </UI.SelectContent>
                </UI.Select>
              </div>
              <div>
                <label htmlFor="Status" className="text-primary-gray text-xs font-montserrat font-semibold">
                  Status
                </label>
                <UI.Select
                  defaultValue="all"
                  onValueChange={(value) => setFilter({ ...filter, status: value })}
                  value={filter.status}
                >
                  <UI.SelectTrigger id="Status" className="w-[6rem]">
                    <UI.SelectValue />
                  </UI.SelectTrigger>
                  <UI.SelectContent>
                    <UI.SelectGroup>
                      <UI.SelectItem value="all">All</UI.SelectItem>
                      <UI.SelectItem value="success">Success</UI.SelectItem>
                      <UI.SelectItem value="failed">Failed</UI.SelectItem>
                      <UI.SelectItem value="processing">Processing</UI.SelectItem>
                    </UI.SelectGroup>
                  </UI.SelectContent>
                </UI.Select>
              </div>
              <div>
                <label htmlFor="Timeframe" className="text-primary-gray text-xs font-montserrat font-semibold">
                  Timeframe
                </label>
                <UI.Select
                  defaultValue="all"
                  onValueChange={(value) => setFilter({ ...filter, timeframe: value })}
                  value={filter.timeframe}
                >
                  <UI.SelectTrigger id="Timeframe" className="w-[6rem]">
                    <UI.SelectValue />
                  </UI.SelectTrigger>
                  <UI.SelectContent>
                    <UI.SelectGroup>
                      <UI.SelectItem value="all">All time</UI.SelectItem>
                      <UI.SelectItem value="today">Today</UI.SelectItem>
                      <UI.SelectItem value="last_7_days">Last 7 days</UI.SelectItem>
                      <UI.SelectItem value="this_month">This month</UI.SelectItem>
                      <UI.SelectItem value="last_30_days">Last 30 days</UI.SelectItem>
                      <UI.SelectItem value="last_90_days">Last 90 days</UI.SelectItem>
                      <UI.SelectItem value="last_180_days">Last 180 days</UI.SelectItem>
                      <UI.SelectItem value="this_year">This year</UI.SelectItem>
                      <UI.SelectItem value="last_year">Last year</UI.SelectItem>
                    </UI.SelectGroup>
                  </UI.SelectContent>
                </UI.Select>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <UI.Button variant={"ghost"} type="button" onClick={handleReset}>
              Reset Filter
            </UI.Button>
            <UI.Button type="button" onClick={handleFilter}>
              Save Filter
            </UI.Button>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
