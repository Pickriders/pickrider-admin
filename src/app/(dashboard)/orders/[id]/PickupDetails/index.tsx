import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronLeft, Info, MapPin, Phone } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const PickupDetails = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="*:font-montserrat h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-x-3">
          <UI.Button
            onClick={() => router.replace(pathname)}
            size={"icon"}
            variant={"ghost"}
          >
            <ChevronLeft size={24} />
          </UI.Button>
          <UI.PrimaryHeading text="Pickup  Details" />
        </div>
        <div className=" flex items-center gap-x-3 mt-10">
          <span className="rounded-lg bg-muted size-6 grid place-items-center">
            <MapPin size={13} />
          </span>
          <div>
            <span className="block text-xs text-primary-gray font-semibold">
              Pickup 1
            </span>
            <span className="text-sm font-semibold text-primary-purple">
              WTC Estate
            </span>
          </div>
          <div className="ms-auto flex items-center gap-x-2">
            <UI.Button size="icon" variant={"ghost"}>
              <SVG.MapSearch className="!size-[20px]" />
            </UI.Button>
          </div>
        </div>
        <div className="mt-6">
          <UI.SectionHeader text="Order Details" />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-primary-gray font-semibold text-xs">
                  Name
                </span>
                <span className="text-sm font-semibold">Onyebuchi Ekene</span>
              </div>
              <UI.Button size={"icon"} variant={"ghost"}>
                <Phone size={21} />
              </UI.Button>
            </div>
            <div>
              <span className="block text-primary-gray font-semibold text-xs">
                Phone Number
              </span>
              <span className="text-sm font-semibold">08123456789</span>
            </div>
            <div>
              <span className="block text-primary-gray font-semibold text-xs">
                Item Name
              </span>
              <span className="text-sm font-semibold">Wristwatch</span>
            </div>
            <div>
              <span className="block text-primary-gray font-semibold text-xs">
                Item category
              </span>
              <span className="text-sm font-semibold">Food</span>
            </div>
            <div>
              <span className="block text-primary-gray font-semibold text-xs">
                Extra Descriptions
              </span>
              <span className="text-sm font-semibold">none.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[#2282C8] flex items-start gap-x-1">
        <Info />
        <p className="text-xs">
          At pickup location, call or message customer for payment and changes
          related to this order example if part or all of the item is not
          available
        </p>
      </div>
    </div>
  );
};
