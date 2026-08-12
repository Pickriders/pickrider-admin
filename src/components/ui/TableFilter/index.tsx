"use client";

import { SVG } from "@/components/svg";
import { Popover, PopoverContent, PopoverTrigger } from "../Popup";
import { Checkbox } from "../Checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Select";
import { Button } from "../Button";
import React from "react";

export const TableFilter = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"}>
          <SVG.FilterIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={10} className="mr-2 sm:mr-10 p-0 w-[92vw] sm:w-[19rem] max-w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">
          Filter Customers
        </h4>
        <div className="py-4 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Checkbox id="have balance" />{" "}
              <label
                htmlFor="have balance"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                Have Balance
              </label>
            </div>
            <div className="flex items-center gap-x-2">
              <Checkbox id="KYC Verified" />{" "}
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
              <label
                htmlFor="TYPE"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                TYPE
              </label>
              <Select defaultValue="all">
                <SelectTrigger id="TYPE" className="w-[6rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="STATUS"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                STATUS
              </label>
              <Select defaultValue="all">
                <SelectTrigger id="STATUS" className="w-[6rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button>Save Filter</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
