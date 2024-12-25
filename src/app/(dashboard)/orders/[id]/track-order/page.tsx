import { UI } from "@/components/ui";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Map } from "../Map";
import { RideStatus } from "./RideStatus";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const TrackOrderPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/orders", label: "Orders" },
          { href: `/orders/${params.id}`, label: "4324" },
        ]}
        rootPageLink="/orders"
        currentPage="Track Rider"
      />
      <section className="bg-background p-6 mt-12 rounded-lg flex gap-x-14  *:font-montserrat">
        <div className="flex-1">
          <div className="flex items-center gap-x-3">
            <UI.Button size={"icon"} variant={"ghost"}>
              <ChevronLeft size={24} />
            </UI.Button>
            <UI.PrimaryHeading text="Track Rider" />
          </div>
          <div>
            <RideStatus />
          </div>
        </div>
        <div className="w-[27rem] h-[33rem]">
          <Map />
        </div>
      </section>
    </div>
  );
};

export default TrackOrderPage;
