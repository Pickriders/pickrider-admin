import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Check, Phone } from "lucide-react";

export const CourierDetails = () => {
  return (
    <div className="mt-8">
      <UI.SectionHeader text="Courier details" />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="size-[1.95rem] rounded-full bg-muted"></div>
          <div>
            <h2 className="font-faktum-test font-bold text-primary-purple text-xs">
              Nnamani Kester
            </h2>
            <span className="text-primary-gray text-xs">Courier</span>
            <div className="w-[2.5rem] h-[1rem] text-xs italic text-red-500">
              Ogwugo
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-1.5">
          <span className="flex items-center gap-x-1 bg-[#DEF4F2] px-3 py-2 rounded-md font-bold font-faktum-test text-[#3FA49F] text-[.6rem]">
            <Check size={13} color="#3FA49F" />
            Rider Assigned
          </span>
          <UI.Button size={"icon"} className="w-[3rem] h-[2.5rem]">
            <Phone className="!size-[1.5rem]" />
          </UI.Button>
          <UI.Button
            variant={"outline"}
            className="group h-[2.5rem] border-primary text-primary"
          >
            <SVG.UserSwitch />
            Reassign Rider
          </UI.Button>
        </div>
      </div>
    </div>
  );
};
