"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import React from "react";
import { format } from "date-fns";

export const FilterDyDate = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [open, setOpen] = React.useState(false);

  const formattedDate = format(date ?? new Date(), "MMM d, yyyy");

  return (
    <UI.Popover open={open} onOpenChange={setOpen}>
      <UI.PopoverTrigger asChild>
        <button className="font-clash-display flex items-center gap-x-3 text-sm font-semibold rounded-lg text-primary-gray px-4 bg-background py-1.5">
          {formattedDate}
          <SVG.ChevronDown />
        </button>
      </UI.PopoverTrigger>
      <UI.PopoverContent side="bottom" className="mr-12 w-[23rem]">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-clash-display font-semibold  text-primary-gray text-sm">
            Pick a date
          </p>
          <button onClick={() => setOpen(false)}>
            <SVG.CloseIcon />
          </button>
        </div>
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
