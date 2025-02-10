import { SvgProps } from "./Svg.type";

export const PlusIcon = ({ className, height = 14, width = 15 }: SvgProps) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.0625 1C8.0625 0.68934 7.81066 0.4375 7.5 0.4375C7.18934 0.4375 6.9375 0.68934 6.9375 1L6.9375 6.4375H1.5C1.18934 6.4375 0.9375 6.68934 0.9375 7C0.9375 7.31066 1.18934 7.5625 1.5 7.5625H6.9375V13C6.9375 13.3107 7.18934 13.5625 7.5 13.5625C7.81066 13.5625 8.0625 13.3107 8.0625 13V7.5625H13.5C13.8107 7.5625 14.0625 7.31066 14.0625 7C14.0625 6.68934 13.8107 6.4375 13.5 6.4375H8.0625L8.0625 1Z"
        className="fill-primary-foreground"
      />
    </svg>
  );
};
