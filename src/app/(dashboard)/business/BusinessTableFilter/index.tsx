import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const BusinessTableFilter = () => {
  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-10 p-0 w-[19rem]">
        <h4 className="text-sm font-clash-display font-semibold py-3 border-b px-3">
          Filter Business
        </h4>
        <div className="py-4 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="have balance" />{" "}
              <label
                htmlFor="have balance"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                Have Balance
              </label>
            </div>
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="Have Riders" />{" "}
              <label
                htmlFor="Have Riders"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                Have Riders
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between mt-7">
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="Have Vehicle" />{" "}
              <label
                htmlFor="Have Vehicle"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                Have Vehicle
              </label>
            </div>
            <div className="flex items-center gap-x-2">
              <UI.Checkbox id="KYC Verified-business" />{" "}
              <label
                htmlFor="KYC Verified-business"
                className="text-primary-gray text-xs font-montserrat font-semibold"
              >
                KYC Verified
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <label
                htmlFor="STATUS"
                className="text-primary-gray text-xs font-faktum-test font-semibold"
              >
                STATUS
              </label>
              <UI.Select defaultValue="all">
                <UI.SelectTrigger id="STATUS" className="w-[6rem]">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectGroup>
                    <UI.SelectItem value="all">All</UI.SelectItem>
                    <UI.SelectItem value="Active">Active</UI.SelectItem>
                    <UI.SelectItem value="Inactive">Inactive</UI.SelectItem>
                    <UI.SelectItem value="Suspended">Suspended</UI.SelectItem>
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
