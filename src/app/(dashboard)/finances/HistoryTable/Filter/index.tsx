"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import React from "react";
import { FilterByType } from "./FilterType";
import { FilterByDate } from "./FilterDate";
import { CheckedIcon, FilterIcon, NotCheckedIcon } from "./Svgs";

export const TableFilter = () => {
  const [selectFiterBy, setFilterBy] = React.useState<"type" | "date">("type");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState<number>(52.5);

  React.useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.clientHeight;
      setContentHeight(contentHeight === 0 ? 52.5 : contentHeight);
    }
  }, [selectFiterBy]);

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button
          variant={"ghost"}
          className="text-primary-gray font-montserrat"
        >
          <FilterIcon />
          Filter
          <SVG.ChevronDown className="fill-primary-gray" />
        </UI.Button>
      </UI.PopoverTrigger>

      {/* Content */}
      <UI.PopoverContent
        sideOffset={10}
        side="top"
        align="start"
        className="p-0 w-[22rem] overflow-hidden"
      >
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">
          Filter Transactions
        </h4>
        <div className="py-4 px-3">
          <div className="flex items-center gap-x-8">
            <button
              onClick={() => setFilterBy("type")}
              className="flex items-center gap-x-2"
            >
              {selectFiterBy === "type" ? <CheckedIcon /> : <NotCheckedIcon />}
              <span className="text-primary-gray font-semibold font-montserrat text-xs">
                Type
              </span>
            </button>
            <button
              onClick={() => setFilterBy("date")}
              className="flex items-center gap-x-2"
            >
              {selectFiterBy === "date" ? <CheckedIcon /> : <NotCheckedIcon />}
              <span className="text-primary-gray font-semibold font-montserrat text-xs">
                Date
              </span>
            </button>
          </div>
          <div
            style={{ height: `${contentHeight}px` }}
            className="mt-5 overflow-hidden transition-[height] duration-300 ease-in-out"
          >
            <div ref={contentRef}>
              {selectFiterBy === "type" ? <FilterByType /> : <FilterByDate />}
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <UI.Button variant={"ghost"}>Reset Filter</UI.Button>
            <UI.Button>Save Filter</UI.Button>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
