import { SvgProps } from "./Svg.type";

export const MoveUpRightArrowIcon = ({ width = 25, height = 24 }: SvgProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.0892 7L6.04663 18"
        stroke="#505582"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.0659 6.13153C11.0659 6.13153 16.7212 5.65664 17.5795 6.51155C18.4377 7.36647 17.9609 13 17.9609 13"
        stroke="#505582"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
