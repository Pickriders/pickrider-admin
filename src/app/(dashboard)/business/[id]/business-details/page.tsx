import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessBalance } from "./BusinessBalance";
import { BusinessStats } from "./BusinessStats";
import { GeneralStats } from "./GeneralStats";
import { OrdersTable } from "./OrdersTable";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const BusinessDetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Peterson Corp"
        linkPage="Business"
        rootPageLink="/business"
      />

      <section className="bg-background rounded-2xl p-10 mt-10">
        <div className="flex items-center justify-between">
          <BusinessBalance />
          <Link
            href={"#"}
            className="group bg-accent-foreground hover:bg-accent-foreground/80 rounded-lg transition-all duration-500 text-primary-foreground p-3.5 flex items-center gap-x-2"
          >
            <SVG.ShieldUser />{" "}
            <span className="font-montserrat text-xs font-semibold">
              Edit business details
            </span>
          </Link>
        </div>

        <div className="flex mt-12 gap-x-12">
          <div className="w-[20.8rem]">
            <BusinessStats />
            <div className="mt-12">
              <GeneralStats />
            </div>
          </div>
          <div className="flex-1">
            <OrdersTable />
          </div>
        </div>
      </section>
    </div>
  );
};
export default BusinessDetailsPage;
