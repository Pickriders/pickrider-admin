import React from "react";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Vehicle } from "@/services";
import { useURLQuery } from "@/hooks";

interface Filter {
  assigned: boolean;
  status: Vehicle["status"] | "all";
}

interface VehicleTableFilterProps {
  onFilter?: (filter: Filter) => void;
}

export const VehicleTableFilter: React.FC<VehicleTableFilterProps> = ({ onFilter }) => {
  const query = useURLQuery();
  const status = query.get("status");
  const isAssigned = query.get("assigned");
  const [filter, setFilter] = React.useState<Filter>({
    assigned: isAssigned === "true" ? true : false,
    status: status === "all" ? "all" : (status as Vehicle["status"]),
  });

  const handleFilter = React.useCallback(() => {
    if (filter.status !== "all") {
      query.set("status", filter.status as string);
    }
    if (filter.assigned) {
      query.set("assigned", "true");
    }
    query.set("page", "1");
  }, [filter, query]);

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-2 sm:mr-10 p-0 w-[92vw] sm:w-[19rem] max-w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">Filter Courier</h4>
        <div className="py-4 px-3">
          <div className="flex items-center gap-x-2">
            <UI.Checkbox
              id="have balance"
              checked={filter.assigned}
              onCheckedChange={(value) => setFilter({ ...filter, assigned: !!value })}
            />
            <label htmlFor="have balance" className="text-primary-gray text-xs font-montserrat font-semibold">
              Assigned
            </label>
          </div>
          <div className="mt-4 flex items-center gap-x-7">
            <div>
              <label htmlFor="STATUS" className="text-primary-gray text-xs font-faktum-test font-semibold">
                STATUS
              </label>
              <UI.Select
                defaultValue="all"
                onValueChange={(value) => {
                  setFilter({ ...filter, status: value as Vehicle["status"] });
                }}
              >
                <UI.SelectTrigger id="STATUS" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="PENDING">Pending</UI.SelectItem>
                    <UI.SelectItem value="VERIFIED">Verified</UI.SelectItem>
                    <UI.SelectItem value="SUSPENDED">Suspended</UI.SelectItem>
                    <UI.SelectItem value="REJECTED">Rejected</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div>
              <label htmlFor="Type" className="text-primary-gray text-xs font-faktum-test font-semibold">
                Type
              </label>
              <UI.Select defaultValue="all">
                <UI.SelectTrigger id="Type" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="bike">Bike</UI.SelectItem>
                    <UI.SelectItem value="truck">Truck</UI.SelectItem>
                    <UI.SelectItem value="van">Van</UI.SelectItem>
                    <UI.SelectItem value="other">Other</UI.SelectItem>
                  </UI.SelectGroup>
                </UI.SelectContent>
              </UI.Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <UI.Button onClick={handleFilter}>Save Filter</UI.Button>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
