"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { status } from "@/constant";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const CustomersTableFilter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const FILTER_STATUS = searchParams.get("status") || "ALL";
  const { replace } = useRouter();

  const handlefilter = (filterBy: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (filterBy) {
      params.set("status", filterBy.toUpperCase());
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-10 p-0 w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">
          Filter Customers
        </h4>
        <div className="py-4 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="have balance" />{" "}
              <label
                htmlFor="have balance"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                Have Balance
              </label>
            </div>
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="KYC Verified" />{" "}
              <label
                htmlFor="KYC Verified"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                KYC Verified
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <UI.Label htmlFor="TYPE" className="text-xs font-faktum-test">
                TYPE
              </UI.Label>

              <UI.Select defaultValue="all">
                <UI.SelectTrigger id="TYPE" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="regular">Regular</UI.SelectItem>
                    <UI.SelectItem value="vendor">Vendor</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div>
              <UI.Label htmlFor="STATUS" className="text-xs font-faktum-test">
                STATUS
              </UI.Label>

              <UI.Select onValueChange={handlefilter} value={FILTER_STATUS}>
                <UI.SelectTrigger id="STATUS" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    {["ALL", ...status].map((stat, i) => {
                      return (
                        <UI.SelectItem key={i} value={stat}>
                          {stat}
                        </UI.SelectItem>
                      );
                    })}
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <UI.Button>Save Filter</UI.Button>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
