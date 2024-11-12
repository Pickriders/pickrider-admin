import { cn } from "@/lib/utils";
import { PrimaryCardProps, Variant } from "../StatsCard.type";
import { SVG } from "@/components/svg";

export const PrimaryStatsCard = ({
  title,
  value,
  variant = "positive",
}: PrimaryCardProps) => {
  const markerColor: Record<Variant, string> = {
    neutral: "bg-primary-black",
    negative: "bg-[#FF5244]",
    positive: "bg-[#32BA7C]",
    muted: "",
  };

  return (
    <div className="max-w-[22rem] group border  flex flex-col justify-between px-6 py-4 h-[130px] bg-card rounded-lg">
      <span className="font-montserrat text-sm text-primary-gray font-semibold">
        {title}
      </span>
      <div className="flex items-center gap-x-5">
        <div
          className={cn("h-[2.1rem] rounded-xl w-1", markerColor[variant])}
        />
        <span className="font-semibold font-clash-display text-xl">
          {value}
        </span>
      </div>

      {/*  Display if variant neutral  */}
      {variant === "neutral" && (
        <div className="flex items-center justify-between">
          <SVG.ChartIcon />
          <span className="text-sm text-[#C7CBE0] font-montserrat font-semibold">
            +0.00%
          </span>
        </div>
      )}

      {/*  Display if variant negative or positive  */}
      {(variant === "negative" || variant === "positive") && (
        <div className=" overflow-hidden relative inline-block w-[2rem] h-6 ms-auto">
          <span className="absolute grid top-0 group-hover:-translate-y-[100%] transition-all duration-300  place-items-center">
            <SVG.MoveUpRightArrowIcon />
          </span>
          <span className="absolute top-[100%] group-hover:top-0 transition-all duration-300 grid place-items-center">
            <SVG.MoveUpRightArrowIcon />
          </span>
        </div>
      )}
    </div>
  );
};
