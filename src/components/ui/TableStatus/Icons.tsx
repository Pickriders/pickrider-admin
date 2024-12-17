import { cn } from "@/lib/utils";

interface ActiveIconProps {
  className?: string;
}

export const ActiveIcon = ({ className }: ActiveIconProps) => {
  return (
    <svg
      width="13"
      height="12"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="6.82129"
        cy="6"
        r="6"
        className={cn("fill-[#3E7DF6]", className)}
        fillOpacity="0.12"
      />
      <circle
        cx="6.82129"
        cy="6"
        r="3"
        className={cn("fill-[#3E7DF6]", className)}
      />
    </svg>
  );
};
