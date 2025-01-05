import { SVG } from "@/components/svg";
import Link from "next/link";
import { ReactNode } from "react";

interface NavigationLinksProps {
  title: string;
  href: string;
  headIcon: ReactNode;
  bgPatternIcon: ReactNode;
}

export const NavigationLinks = ({
  headIcon,
  href,
  bgPatternIcon,
  title,
}: NavigationLinksProps) => {
  return (
    <Link
      href={href}
      className=" setting-nav-card z-10 relative h-[8.2rem] bg-primary-black  flex items-center justify-between pr-[2.3rem] pl-5 rounded-lg border"
    >
      <div>
        {headIcon}
        <h2 className="font-clash-display  mt-1.5 font-semibold text-white">
          {title}
        </h2>
      </div>
      <button className="  grid place-items-center top-1/2 bg-[#27272a]  size-[1.7rem] right-6 rounded-full">
        <SVG.ChevronRightIcon className="fill-white" />
      </button>
      <div className="absolute right-0 -z-10">{bgPatternIcon}</div>
    </Link>
  );
};
