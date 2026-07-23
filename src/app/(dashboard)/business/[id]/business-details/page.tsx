import { SVG } from "@/components/svg";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessBalance } from "./BusinessBalance";
import { BusinessCrumb } from "./BusinessCrumb";
import { BusinessStats } from "./BusinessStats";
import { GeneralStats } from "./GeneralStats";
import { OrdersTable } from "./OrdersTable";
import { ShieldCheck } from "lucide-react";

const BusinessDetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <BusinessCrumb businessId={params.id} />

      <section className="bg-background rounded-2xl sm:p-10 p-5 mt-10">
        <div className="flex lg:flex-row flex-col gap-y-4 lg:items-center justify-between">
          <BusinessBalance businessId={params.id} />
          <div className="flex flex-wrap items-center gap-3">
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

        <div className="flex lg:flex-row flex-col mt-12 gap-x-12 gap-y-10">
          <div className="lg:w-[20.8rem] w-full">
            <BusinessStats businessId={params.id} />
            <div className="mt-12">
              <GeneralStats businessId={params.id} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <OrdersTable businessId={params.id} />
          </div>
        </div>
      </section>
    </div>
  );
};
export default BusinessDetailsPage;
