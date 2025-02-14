import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { status } from "@/constant";
import { useTableUrlFilter } from "@/hooks";

export const CouriersTableFilter = () => {
  const { searchParams, updateFilter } = useTableUrlFilter();
  const FILTER_STATUS = searchParams.get("status") || "ALL";

  const filterStatus = (filterBy: string) => {
    updateFilter("status", filterBy.toUpperCase());
  };

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-10 p-0 w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">Filter Courier</h4>
        <div className="py-4 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="have balance" />{" "}
              <label htmlFor="have balance" className="text-primary-gray text-xs font-montserrat font-semibold">
                Have License
              </label>
            </div>
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="KYC Verified" />{" "}
              <label htmlFor="KYC Verified" className="text-primary-gray text-xs font-montserrat font-semibold">
                Have Balance
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <label htmlFor="STATUS" className="text-primary-gray text-xs font-faktum-test font-semibold">
                STATUS
              </label>
              <UI.Select onValueChange={filterStatus} value={FILTER_STATUS}>
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
