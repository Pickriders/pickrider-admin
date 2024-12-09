import { cn } from "@/lib/utils";
import { SvgProps } from "./Svg.type";

export const XIcon = ({ height = 21, width = 21, className }: SvgProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("stroke-foreground", className)}
    >
      <path
        d="M5 5L19 19M5.00003 19L12 12L19 5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
