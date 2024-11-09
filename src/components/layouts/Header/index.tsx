import { SVG } from "@/components/svg";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="h-[6.2rem] py-3 pl-6 pr-9 bg-background flex items-center justify-between">
      <Link href={"/dashboard"} className=" pt-2 inline-block mb-0">
        <SVG.LogoIcon />
      </Link>
      <div>
        <button className="size-[2.3rem] grid place-items-center border rounded-full">
          <SVG.NotificationIcon />
        </button>
      </div>
    </header>
  );
};
