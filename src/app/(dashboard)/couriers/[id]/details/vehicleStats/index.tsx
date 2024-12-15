import { UI } from "@/components/ui";

export const VehicleStats = () => {
  return (
    <div>
      <UI.SectionHeader text="VEHICLE ASSIGNED" />
      <div className="mt-5  grid grid-cols-2 gap-x-14 gap-y-8 w-[19rem] ">
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Bike Number
          </h4>
          <p className="font-semibold text-primary-purple text-xs">AE-25554</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-primary-gray text-xs">
            Total orders
          </h4>
          <p className="font-semibold text-primary-purple text-xs">
            Total orders
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
            Uncompleted orders
          </h4>
          <p className="font-semibold text-primary-purple text-xs">32</p>
        </div>
      </div>
    </div>
  );
};
