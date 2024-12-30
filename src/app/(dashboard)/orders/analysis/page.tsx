import { UI } from "@/components/ui";
import { ChevronLeft } from "lucide-react";
import { CalenderDate } from "./Date";
import { StatusOverview } from "./StatusOverview";
import { StatusChart } from "./StatusChart";
import { Distributions } from "./Distributions";
import { TypeOverview } from "./TypeOverview";
import { TypeChart } from "./TypeChart";

const OrderAnalysis = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/orders", label: "Orders" }]}
        rootPageLink="/orders"
        currentPage="Order Analysis"
      />
      <section className="mt-11 bg-background rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <UI.Button size={"icon"} variant={"ghost"}>
              <ChevronLeft size={17} />
            </UI.Button>
            <h1 className="font-semibold font-clash-display">Order Analysis</h1>
          </div>
          <div>
            <CalenderDate />
          </div>
        </div>
        <div className="mt-5 flex  gap-x-8 justify-between">
          <div className="w-[35rem] flex-shrink-0">
            <StatusOverview />
          </div>
          <div className="flex-1 w-[30rem]">
            <StatusChart />
          </div>
        </div>
        <Distributions />
        <div className="w-full border my-9" />
        <div className="mt-5 flex  gap-x-8 justify-between">
          <div className="w-[35rem]">
            <TypeOverview />
          </div>
          <div className="flex-1 w-[30rem]">
            <TypeChart />
          </div>
        </div>
      </section>
    </div>
  );
};
export default OrderAnalysis;
