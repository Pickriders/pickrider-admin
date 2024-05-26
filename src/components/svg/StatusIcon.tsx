import { SvgProps } from "./Svg.type";

export const StatusIcon = ({ color }: SvgProps) => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6.25" cy="6.5" r="6" fill={color} fill-opacity="0.12" />
      <circle cx="6.25" cy="6.5" r="3" fill={color} />
    </svg>
  );
};
