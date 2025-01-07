import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const Filter = () => {
  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant={"ghost"}>
          <SVG.FilterIcon />
        </UI.Button>
      </UI.PopoverTrigger>
    </UI.Popover>
  );
};
