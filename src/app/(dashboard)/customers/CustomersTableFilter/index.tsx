"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { UI } from "@/components/ui";
import { useURLQuery } from "@/hooks";

const STATUSES = ["ALL", "ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"];

export const CustomersTableFilter = () => {
  const query = useURLQuery();
  const [status, setStatus] = React.useState(query.get("status") || "ALL");
  const [verifiedOnly, setVerifiedOnly] = React.useState(query.get("verified") === "true");

  const apply = () => {
    query.setMultiple({
      status: status === "ALL" ? undefined : status,
      verified: verifiedOnly ? "true" : undefined,
      page: "1",
    });
  };

  const reset = () => {
    setStatus("ALL");
    setVerifiedOnly(false);
    query.setMultiple({ status: undefined, verified: undefined, page: "1" });
  };

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant="outline">
          <SlidersHorizontal size={15} />
          Filter
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} align="end" className="w-[19rem] p-0">
        <h4 className="border-b px-4 py-3 text-sm font-semibold">Filter customers</h4>
        <div className="space-y-4 px-4 py-4">
          <div>
            <UI.Label className="text-xs">Status</UI.Label>
            <UI.Select value={status} onValueChange={setStatus}>
              <UI.SelectTrigger className="mt-1 w-full">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                {STATUSES.map((s) => (
                  <UI.SelectItem key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </UI.SelectItem>
                ))}
              </UI.SelectContent>
            </UI.Select>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <UI.Checkbox checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(!!v)} />
            <span className="text-sm font-semibold text-foreground">Phone-verified only</span>
          </label>

          <div className="flex items-center justify-between pt-1">
            <UI.Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </UI.Button>
            <UI.Button size="sm" onClick={apply}>
              Apply filter
            </UI.Button>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
