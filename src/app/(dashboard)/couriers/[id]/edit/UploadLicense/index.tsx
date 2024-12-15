import { UI } from "@/components/ui";
import { File } from "lucide-react";
import { TickIcon } from "./TickIcon";

export const UploadLicense = () => {
  return (
    <div>
      <p className="font-bold text-primary-gray font-montserrat text-xs">
        Upload rider’s Drivers License
      </p>

      {/* FILE */}
      <div className="flex items-start gap-x-3 p-3 mt-3 border border-primary  w-full h-[5.5rem] rounded-lg">
        <div className="size-[2rem] rounded-full grid place-items-center bg-accent">
          <File size={14} />
        </div>
        <div className="flex-grow">
          <span className="inline-block font-semibold font-montserrat text-sm">
            20240815_24244.png
          </span>
          <span className="block font-semibold font-montserrat text-sm text-primary-gray">
            200 KB
          </span>
          <div className="mt-1 flex items-center gap-x-2">
            <div className="bg-accent h-1.5 flex-grow   rounded-md">
              <div className="h-full bg-primary w-1/2 rounded-md"></div>
            </div>
            <span className="inline-block text-xs font-semibold font-montserrat">
              50%
            </span>
          </div>
        </div>
        <div>
          <TickIcon />
        </div>
      </div>

      {/* Date */}
      <div className="mt-6">
        <UI.Input
          labelValue="License Expiring Date"
          id="License Expiring Date"
          className="w-[10rem] text-primary-purple"
          defaultValue={"23/11/26"}
        />
      </div>
    </div>
  );
};
