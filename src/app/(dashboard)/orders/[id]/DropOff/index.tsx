import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { MapPin } from "lucide-react";

export const DropOff = () => {
  return (
    <div className="*:font-montserrat flex items-center gap-x-3 py-3">
      <span className="rounded-lg bg-muted size-6 grid place-items-center">
        <MapPin size={13} />
      </span>
      <div>
        <span className="block text-xs text-primary-gray font-semibold">
          Drop-off
        </span>
        <span className="text-sm font-semibold text-primary-purple">
          33B Sir Ken Nnamdi Drive
        </span>
      </div>
      <div className="ms-auto flex items-center gap-x-2">
        <UI.Button size="icon" variant={"ghost"}>
          <SVG.MapSearch className="!size-[20px]" />
        </UI.Button>
      </div>
    </div>
  );
};
