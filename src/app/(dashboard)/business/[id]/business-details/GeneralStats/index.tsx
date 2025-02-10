import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const GeneralStats = () => {
  return (
    <div className="font-montserrat">
      <UI.SectionHeader text=" GENERAL STATS" />

      <div className="mt-5  grid grid-cols-2 gap-x-14 gap-y-8 w-[19rem] ">
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Vehicles</h4>
          <p className="font-semibold flex items-center justify-between text-primary-purple text-xs">
            32
            <SVG.MoveUpRightArrowIcon width={13} height={13} />
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">Riders</h4>
          <p className="font-semibold flex items-center justify-between text-primary-purple text-xs">
            32
            <SVG.MoveUpRightArrowIcon width={13} height={13} />
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Completed orders
          </h4>
          <p className="font-semibold text-primary-purple text-xs">32</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Total Reviews
          </h4>
          <p className="font-semibold text-primary-purple text-xs">32</p>
        </div>
      </div>
    </div>
  );
};
