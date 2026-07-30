import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import { Suspense } from "react";
import { OrdersBoard } from "./OrdersBoard";

const OrdersPage = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything happening across the platform, live.</p>
        </div>
        <UI.Button asChild>
          <Link href={"/orders/analysis"} className="flex items-center gap-x-2">
            View Analysis
            <SVG.Analysis />
          </Link>
        </UI.Button>
      </div>
      <section className="mt-6">
        <Suspense>
          <OrdersBoard />
        </Suspense>
      </section>
    </div>
  );
};
export default OrdersPage;
