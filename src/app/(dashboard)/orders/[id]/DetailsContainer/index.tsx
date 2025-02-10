"use client";

import { UI } from "@/components/ui";
import { OrderDetails } from "../OrderDetails";
import { OrderLocations } from "../OrderLocations";
import { DropOff } from "../DropOff";
import { CourierDetails } from "../CourierDetails";
import { FooterControl } from "../FooterControl";
import { PickupDetails } from "../PickupDetails";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export const DetailsContainer = () => {
  const serachParm = useSearchParams();
  const pickupDetails = serachParm.get("pickup-details");

  return (
    <div className=" h-full">
      {pickupDetails ? (
        <motion.div
          initial={{ translateY: 50, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full"
        >
          <PickupDetails />
        </motion.div>
      ) : (
        <motion.div
          key={pickupDetails}
          initial={{ translateY: 50, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <UI.SectionHeader text="Order details" />
          <div className="mt-3">
            <OrderDetails />
          </div>
          <div className="mt-5">
            <OrderLocations />
            <div className="w-full border-t mt-3" />
            <DropOff />
          </div>
          <CourierDetails />
          <div className="mt-20">
            <FooterControl />
          </div>
        </motion.div>
      )}
    </div>
  );
};
