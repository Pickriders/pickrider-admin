import { UI } from "@/components/ui";
import { notFound } from "next/navigation";
import { Map } from "./Map";

import { DetailsContainer } from "./DetailsContainer";
import { Suspense } from "react";
import { BreadCrumbNav } from "./BreadCrumbNav";

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
      {/* <UI.BreadCrumbNav
        pageLinks={[{ href: "/orders", label: "Orders" }]}
        rootPageLink="/orders"
        currentPage="4324"
      /> */}
      <Suspense>
        <BreadCrumbNav />
      </Suspense>

      <section className="bg-background p-6 mt-12 rounded-lg flex gap-x-14  *:font-montserrat">
        <div className="flex-1">
          <Suspense>
            <DetailsContainer />
          </Suspense>
        </div>

        <div className="w-[27rem] min-h-[32rem]">
          <Map />
        </div>
      </section>
    </div>
  );
};

export default OrderPage;
