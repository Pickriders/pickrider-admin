import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const FilterDyDate = () => {
  return (
    <UI.DropdownMenu>
      <UI.DropdownMenuTrigger asChild>
        <button className="font-clash-display flex items-center gap-x-3 text-sm font-semibold rounded-lg text-primary-gray px-4 bg-background py-1.5">
          Jan, 2023 <SVG.ChevronDown />
        </button>
      </UI.DropdownMenuTrigger>
    </UI.DropdownMenu>
  );
};
