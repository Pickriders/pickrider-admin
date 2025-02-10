import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessBalance } from "./BusinessBalance";
import { BusinessStats } from "./BusinessStats";
import { GeneralStats } from "./GeneralStats";
import { OrdersTable } from "./OrdersTable";
import { ShieldCheck } from "lucide-react";

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
        pageLinks={[{ href: "/business", label: "Business" }]}
        rootPageLink="/business"
      />

      <section className="bg-background rounded-2xl p-10 mt-10">
        <div className="flex items-center justify-between">
          <BusinessBalance />
          <div className="flex items-center gap-x-3">
            <Link
              href={"verification"}
              className="group [&_svg]:dark:stroke-black bg-accent-foreground hover:bg-accent-foreground/80 rounded-lg transition-all duration-500 text-primary-foreground p-3.5 flex items-center gap-x-2"
            >
              <ShieldCheck />
              <span className="font-montserrat text-xs font-semibold">
               Business Verification
              </span>
            </Link>
            <Link
              href={"edit"}
              className="group [&_svg]:dark:stroke-black bg-accent-foreground hover:bg-accent-foreground/80 rounded-lg transition-all duration-500 text-primary-foreground p-3.5 flex items-center gap-x-2"
            >
              <SVG.ShieldUser />{" "}
              <span className="font-montserrat text-xs font-semibold">
                Edit business details
              </span>
            </Link>
          </div>
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
