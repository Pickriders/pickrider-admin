import { UI } from "@/components/ui";
import { ChevronLeft } from "lucide-react";
import { Tables } from "./Tables";
import Link from "next/link";

const MoreOrdersPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        currentPage={"More Orders"}
        pageLinks={[{ href: "/orders", label: "Orders" }]}
        rootPageLink="orders"
      />

      <section className="mt-11 bg-background rounded-2xl px-4 py-4">
        <div className="flex items-center gap-x-3">
          <UI.Button size={"icon"} variant={"ghost"} asChild>
            <Link href={"/orders/analysis"}>
              <ChevronLeft size={17} />
            </Link>
          </UI.Button>
          <h1 className="font-semibold  font-clash-display">More Orders</h1>
        </div>

        <div className="mt-4">
          <Tables />
        </div>
      </section>
    </div>
  );
};
export default MoreOrdersPage;
