import { SvgProps } from "./Svg.type";

export const GreenTick = ({
  color = "#32BA7C",
  height = 14,
  width = 15,
}: SvgProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.07137 12.8333C10.2797 12.8333 12.9047 10.2083 12.9047 7C12.9047 3.79167 10.2797 1.16667 7.07137 1.16667C3.86304 1.16667 1.23804 3.79167 1.23804 7C1.23804 10.2083 3.86304 12.8333 7.07137 12.8333Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.59229 7L6.24312 8.65083L9.55062 5.34917"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
