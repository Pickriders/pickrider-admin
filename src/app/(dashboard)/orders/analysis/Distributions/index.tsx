import { Crosshair } from "lucide-react";

export const Distributions = () => {
  return (
    <div className="mt-5">
      <h2 className="font-bold font-montserrat text-xs text-end">
        Distribution
      </h2>
      <div className="flex gap-x-6 justify-end mt-4">
        <div className="flex items-center gap-x-3">
          <div className="size-[10px] rounded-full bg-[#32BA7C]" />
          <span className="font-bold font-montserrat text-xs">
            Completed Order
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </div>
        <div className="flex items-center gap-x-3">
          <div className="size-[10px] rounded-full bg-[#FF5244]" />
          <span className="font-bold font-montserrat text-xs">
            Cancelled Order
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </div>
        <div className="flex items-center gap-x-3">
          <div className="size-[10px] rounded-full bg-[#505582]" />
          <span className="font-bold font-montserrat text-xs">
            Rejected Order{" "}
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </div>
        <div className="flex items-center gap-x-3">
          <div className="size-[10px] rounded-full bg-[#1E1F1F]" />
          <span className="font-bold font-montserrat text-xs">
            Missed Order
          </span>
          <Crosshair size={24} className="text-primary-gray" />
        </div>
      </div>
    </div>
  );
};
