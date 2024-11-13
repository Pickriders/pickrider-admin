import { SVG } from "@/components/svg";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { Notification } from "./Notification";

export const Header = () => {
  return (
    <header className="h-[6.2rem] py-3 pl-6 pr-9 bg-background sticky top-0 z-[100] border-b  flex items-center justify-between">
      <Link href={"/dashboard"} className=" pt-2 inline-block mb-0">
        <SVG.LogoIcon />
      </Link>
      <div className="flex items-center gap-x-4">
        <Notification />
        <UserMenu />
      </div>
    </header>
  );
};
