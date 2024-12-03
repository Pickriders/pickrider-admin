import Link from "next/link";
import { SecondaryCardProps } from "../StatsCard.type";
import { SvgCardBgPattern } from "../SvgCardBgPattern";
import { SVG } from "@/components/svg";

export const SecondaryCard = ({ icon, title, value }: SecondaryCardProps) => {
  return (
    <Link
      href={""}
      className="max-w-[22rem] overflow-hidden   text-white  group border  flex flex-col justify-between px-6 py-4 h-[130px] bg-primary-black relative rounded-lg"
    >
      <span className="size-[2rem] bg-[#ffffff13] grid place-items-center rounded-lg">
        {icon}
      </span>
      <span className="font-semibold font-clash-display ">{title}</span>
      <span className="font-semibold font-clash-display text-xl">{value}</span>
      <div className="absolute right-0 top-0 transition-all duration-700 ease-in group-hover:translate-y-[-25px] group-hover:translate-x-[-25px] ">
        <SvgCardBgPattern />
      </div>
      <button className="absolute  grid place-items-center top-1/2 bg-[#27272a] -translate-y-1/2 size-[1.7rem] right-6 rounded-full">
        <SVG.ChevronRightIcon className="fill-white" />
      </button>
    </Link>
  );
};
