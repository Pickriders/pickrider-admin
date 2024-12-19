import { UI } from "@/components/ui";
import React from "react";

export const FilterByDate = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div>
      <UI.DateCalendar mode="single" selected={date} onSelect={setDate} />
    </div>
  );
};
