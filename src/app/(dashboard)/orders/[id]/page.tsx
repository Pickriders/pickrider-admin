import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { Map } from "./Map";
import { CourierDetails } from "./CourierDetails";
import { FooterControl } from "./FooterControl";
import { OrderLocations } from "./OrderLocations";
import { DropOff } from "./DropOff";
import { OrderDetails } from "./OrderDetails";
import { PickupDetails } from "./PickupDetails";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const OrderPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/orders", label: "Orders" }]}
        rootPageLink="/orders"
        currentPage="4324"
      />

      <section className="bg-background p-6 mt-12 rounded-lg flex gap-x-14  *:font-montserrat">
        <div className="flex-1">
          {/* <PickupDetails /> */}
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
            <FooterControl id={params.id} />
          </div>
        </div>
        <div className="w-[27rem] h-[33rem]">
          <Map />
        </div>
      </section>
    </div>
  );
};

export default OrderPage;
