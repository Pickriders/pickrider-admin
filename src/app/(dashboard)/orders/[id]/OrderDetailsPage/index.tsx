"use client";

import { MapView } from "./Map";

import { DetailsContainer } from "./DetailsContainer";
import { UI } from "@/components/ui";
import { useGetOrderQuery } from "@/api/queries/orders";
import { APIProvider } from "@vis.gl/react-google-maps";
import { GOOGLE_MAP_API_KEY } from "@/constant";

interface OrderDetailsPageProps {
  orderId: string;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId }) => {
  const { data, isLoading } = useGetOrderQuery(orderId);

  if (isLoading) {
    return (
      <>
        <UI.Skeleton className="h-[1.5rem] w-[10rem] mb-[2.5rem]" />
        <UI.Skeleton className="h-[32rem] w-full" />
      </>
    );
  }

  return (
    <div>
      <UI.BreadCrumbNav pageLinks={[{ href: "/orders", label: "Orders" }]} rootPageLink="/orders" currentPage="4324" />

      <section className="bg-background p-6 mt-12 rounded-lg flex gap-x-14  *:font-montserrat">
        <div className="flex-1">
          <DetailsContainer order={data} />
        </div>

        <div className="w-[27rem] min-h-[32rem]">
          <APIProvider apiKey={GOOGLE_MAP_API_KEY ?? ""}>
            <MapView order={data} />
          </APIProvider>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
