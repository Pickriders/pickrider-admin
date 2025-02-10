import { OrdersTable } from "@/components/OrdersTable";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";

const OrdersPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Orders" />
        <UI.Button asChild>
          <Link href={"/orders/analysis"} className="flex items-center gap-x-2">
            View Analysis
            <SVG.Analysis />
          </Link>
        </UI.Button>
      </div>
      <section className="mt-[2rem]">
        <OrdersTable data={Array(4).fill(0)} />
      </section>
    </div>
  );
};
export default OrdersPage;
