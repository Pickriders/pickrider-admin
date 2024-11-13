"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import React from "react";
import { format } from "date-fns";

export const FilterDyDate = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const formattedDate = format(date ?? new Date(), "MMM d, yyyy");

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <button className="font-clash-display flex items-center gap-x-3 text-sm font-semibold rounded-lg text-primary-gray px-4 bg-background py-1.5">
          {formattedDate}
          <SVG.ChevronDown />
        </button>
      </UI.PopoverTrigger>
      <UI.PopoverContent side="bottom" className="mr-12 w-[23rem]">
        <p className="font-clash-display font-semibold mb-3 text-primary-gray text-sm">
          Pick a date
        </p>
        <UI.Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className=" "
        />
      </UI.PopoverContent>
    </UI.Popover>
  );
};
