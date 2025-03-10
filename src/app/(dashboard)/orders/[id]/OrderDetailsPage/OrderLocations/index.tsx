import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { OrderLocation } from "@/services";
import { Info, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderLocationsProps {
  title: string;
  locations: OrderLocation[];
}
export const OrderLocations: React.FC<OrderLocationsProps> = ({ title, locations }) => {
  const router = useRouter();

  return (
    <div className="space-y-4 max-h-[9.4rem] pr-4 scroll-bar overflow-y-auto">
      {locations.map((location, i) => (
        <div key={i} className="*:font-montserrat flex items-center gap-x-3">
          <span className="rounded-lg bg-muted size-6 grid place-items-center">
            <MapPin size={13} />
          </span>
          <div>
            <span className="block text-xs text-primary-gray font-semibold">
              {title} {locations.length > 1 ? i + 1 : ""}
            </span>
            <span className="text-sm font-semibold text-primary-purple">{location.address}</span>
          </div>
          <div className="ms-auto flex items-center gap-x-2">
            <UI.Button size="icon" variant={"ghost"}>
              <SVG.MapSearch className="!size-[20px]" />
            </UI.Button>
            <UI.Button onClick={() => router.push(`?location-details=${location._id}`)} size="icon" variant={"ghost"}>
              <Info className="!size-[20px]" />
            </UI.Button>
          </div>
        </div>
      ))}
    </div>
  );
};
