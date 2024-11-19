"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import React from "react";
import dayjs from "dayjs";

export const FilterDyDate = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [open, setOpen] = React.useState(false);

  const formattedDate = dayjs(date ?? new Date()).format("MMM D, YYYY");

  return (
    <UI.Popover open={open} onOpenChange={setOpen}>
      <UI.PopoverTrigger asChild>
      
        <UI.Button variant={"outline"}>
          {formattedDate}
          <SVG.ChevronDown />
        </UI.Button>
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
        <UI.DateCalendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className=" "
        />
      </UI.PopoverContent>
    </UI.Popover>
  );
};
