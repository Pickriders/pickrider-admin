import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const VehicleTableFilter = () => {
  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button disabled variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
    </UI.Popover>
  );
};
