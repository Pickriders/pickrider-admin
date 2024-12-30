"use client";

import { UI } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import React from "react";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";

export const CalenderDate = () => {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [open, setOpen] = React.useState(false);

  const formattedDate = date
    ? date.from && date.to
      ? `${dayjs(date.from).format("MMM D, YYYY")} - ${dayjs(date.to).format(
          "MMM D, YYYY"
        )}`
      : date.from
      ? dayjs(date.from).format("MMM D, YYYY")
      : "Select a date"
    : "Select a date";

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"} className="">
          {formattedDate}
          <ChevronDown size={15} />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent side="bottom" className="w-[20rem] mr-16">
        <UI.DateCalendar mode="range" selected={date} onSelect={setDate} />
      </UI.PopoverContent>
    </UI.Popover>
  );
};
