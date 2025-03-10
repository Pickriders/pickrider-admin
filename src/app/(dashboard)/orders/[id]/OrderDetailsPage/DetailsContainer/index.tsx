"use client";

import { UI } from "@/components/ui";
import { CustomerDetails } from "../CustomerDetails";
import { OrderLocations } from "../OrderLocations";
import { CourierDetails } from "../CourierDetails";
import { FooterControl } from "../FooterControl";
import { LocationDetails } from "../LocationDetails";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Order } from "@/services";

interface DetailsContainerProps {
  order?: Order;
}

export const DetailsContainer: React.FC<DetailsContainerProps> = ({ order }) => {
  const serachParm = useSearchParams();
  const locationId = serachParm.get("location-details");
  const locationDetails = order?.locations?.find((location) => location._id === locationId);

  const dropOffLocations = order?.locations?.filter((location) => location.type === "DROPOFF") ?? [];
  const pickupLocations = order?.locations?.filter((location) => location.type === "PICKUP") ?? [];

  return (
    <div className=" h-full">
      {locationId ? (
        <motion.div
          initial={{ translateY: 50, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full"
        >
          <LocationDetails location={locationDetails} />
        </motion.div>
      ) : (
        <motion.div
          key={locationId}
          initial={{ translateY: 50, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <UI.SectionHeader text="Order details" />
          <div className="mt-3">{order && <CustomerDetails user={order?.user} amount={order?.negotiatedAmount} />}</div>
          <div className="mt-5">
            <OrderLocations title="Pickup" locations={pickupLocations} />
            <div className="w-full border-t my-3" />
            <OrderLocations title="Drop-off" locations={dropOffLocations} />
          </div>
          <CourierDetails rider={order?.rider} />
          <div className="mt-20">
            <FooterControl />
          </div>
        </motion.div>
      )}
    </div>
  );
};
