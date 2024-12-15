import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";

export const RidersStats = () => {
  return (
    <div>
      <UI.SectionHeader text="RIDER STATS" />
      <div className="mt-5  grid grid-cols-2 gap-x-14 gap-y-8 w-[19rem] ">
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Phone Number
          </h4>
          <p className="font-semibold text-primary-purple text-xs">
            08123456789
          </p>
        </div>

        <Link href={"orders"} className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Total Orders
          </h4>
          <p className="font-semibold flex items-center justify-between text-primary-purple text-xs">
            245
            <SVG.MoveUpRightArrowIcon width={13} height={13} />
          </p>
        </Link>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Average Rating
          </h4>
          <p className="font-semibold text-primary-purple text-xs">4.2</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Total Reviews
          </h4>
          <p className="font-semibold text-primary-purple text-xs">240</p>
        </div>
      </div>
    </div>
  );
};
