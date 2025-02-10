import { cn } from "@/lib/utils";
import { SvgProps } from "./Svg.type";

export const WarningIcon = ({
  className,
  height = 40,
  width = 40,
}: SvgProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("stroke-[#FF5244]", className)}
    >
      <path
        d="M8.86969 16.1385C12.8925 9.02031 14.9039 5.46117 17.664 4.545C19.1823 4.04099 20.818 4.04099 22.3363 4.545C25.0965 5.46117 27.1078 9.02031 31.1307 16.1385C35.1535 23.2567 37.1648 26.8159 36.5615 29.7159C36.2295 31.3114 35.4117 32.7584 34.2252 33.8499C32.0685 35.8337 28.0458 35.8337 20.0002 35.8337C11.9546 35.8337 7.93179 35.8337 5.7751 33.8499C4.58864 32.7584 3.77082 31.3114 3.43887 29.7159C2.83549 26.8159 4.84689 23.2567 8.86969 16.1385Z"
        strokeWidth="2.5"
      />
      <path
        d="M19.9868 26.667H20.0018"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 21.6667V15"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
