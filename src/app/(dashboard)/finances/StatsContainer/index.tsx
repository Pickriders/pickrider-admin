import { SVG } from "@/components/svg";

export const StatsContainer = () => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="max-w-[32rem] w-full overflow-hidden   text-white  group border  flex flex-col justify-between px-6 py-4 h-[130px] bg-primary-black relative rounded-lg">
        <span className="size-[2rem] bg-[#ffffff13] grid place-items-center rounded-lg">
          <SVG.BalanceIcon />
        </span>
        <span className="font-semibold font-clash-display ">
          Current Balance
        </span>
        <span className="font-semibold font-clash-display text-xl">$0</span>
        <div className="absolute opacity-55  right-0 top-0 transition-all duration-700 ease-in group-hover:translate-y-[-25px] group-hover:translate-x-[-25px] ">
          <SVG.SvgCardBgPattern />
        </div>
      </div>
      <div className="rounded-lg bg-[#DEF4F2] py-4 flex-1 px-4 h-[130px]">
        <div>
          <span className="font-montserrat text-sm text-primary-gray font-semibold">
            Total Revenue
          </span>
          <div className="flex mt-2 items-center gap-x-5">
            <div className="h-[2.1rem] w-[4px] rounded-2xl bg-[#32BA7C]" />
            <span className="font-semibold font-clash-display text-2xl">
              $0
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-[#FF52441F] flex-1 py-4 px-4 h-[130px]">
        <div>
          <span className="font-montserrat text-sm text-primary-gray font-semibold">
            Total Expenditure
          </span>
          <div className="flex mt-2 items-center gap-x-5">
            <div className="h-[2.1rem] w-[4px] rounded-2xl bg-[#FF5244]" />
            <span className="font-semibold font-clash-display text-2xl">
              $0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
