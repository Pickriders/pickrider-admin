import { MapPin } from "lucide-react";

export const OrderDetails = () => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="size-[2.6rem] rounded-full bg-muted">
        {/* <Image
                alt="prof"
                src={""}
                width={200}
                height={100}
                className="w-full h-full object-cover"
              /> */}
      </div>
      <div>
        <h2 className="text-primary-purple font-bold font-clash-display">
          Frankpeter Ani
        </h2>
        <p className="text-primary-gray text-xs font-semibold flex items-center gap-x-2">
          <MapPin size={13} />
          30km away
        </p>
      </div>
      <div className="ms-auto text-center">
        <p className="text-primary-gray font-semibold text-xs ">Fee</p>
        <span className="font-semibold text-2xl font-clash-display">$350</span>
      </div>
    </div>
  );
};
