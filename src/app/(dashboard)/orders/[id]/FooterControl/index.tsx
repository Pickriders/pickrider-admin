import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Check } from "lucide-react";

export const FooterControl = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <button className="font-semibold flex px-3 py-1.5 gap-x-1    items-center text-xs text-[#32BA7C] border border-[#32BA7C] rounded-lg">
          <Check size={17} />
          Mark as complete
        </button>
      </div>
      <div className="flex items-center gap-x-4">
        <UI.Button variant={"outline"} className="border-primary text-primary">
          <SVG.NavigatorTrack />
          Track Rider
        </UI.Button>
        <UI.Button>
          <SVG.NightShield />
          Update Status
        </UI.Button>
      </div>
    </div>
  );
};
