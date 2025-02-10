"use client";

import { UI } from "@/components/ui";
import { usePathname, useSearchParams } from "next/navigation";

export const BreadCrumbNav = () => {
  const pickupDetails = useSearchParams().get("pickup-details");
  const pathname = usePathname();

  return (
    <UI.BreadCrumbNav
      pageLinks={[
        { href: "/orders", label: "Orders" },
        { href: pathname, label: "43650" },
      ]}
      rootPageLink="/orders"
      currentPage={pickupDetails ? "Pickup Details" : null}
    />
  );
};
