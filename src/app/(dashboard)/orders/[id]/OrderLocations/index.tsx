import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Info, MapPin } from "lucide-react";

export const OrderLocations = ({ locations = Array(6).fill(0) }) => {
  return (
    <div className="space-y-4 h-[9.4rem] pr-4 scroll-bar overflow-y-auto">
      {locations.map((location, i) => (
        <div key={i} className="*:font-montserrat flex items-center gap-x-3">
          <span className="rounded-lg bg-muted size-6 grid place-items-center">
            <MapPin size={13} />
          </span>
          <div>
            <span className="block text-xs text-primary-gray font-semibold">
              Pickup {i + 1}
            </span>
            <span className="text-sm font-semibold text-primary-purple">
              WTC Estate
            </span>
          </div>
          <div className="ms-auto flex items-center gap-x-2">
            <UI.Button size="icon" variant={"ghost"}>
              <SVG.MapSearch className="!size-[20px]" />
            </UI.Button>
            <UI.Button size="icon" variant={"ghost"}>
              <Info className="!size-[20px]" />
            </UI.Button>
          </div>
        </div>
      ))}
    </div>
  );
};
