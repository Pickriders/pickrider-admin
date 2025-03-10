import { Offer } from "@/services";
import { DataTable } from "./DataTable";
import { Suspense } from "react";

interface OffersProps {
  offers: Offer[];
}

export const Offers: React.FC<OffersProps> = ({ offers }) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-clash-display font-semibold">Offers</h1>
      </div>
      <div className="mt-8">
        <Suspense>
          <DataTable offers={offers} />
        </Suspense>
      </div>
    </div>
  );
};
