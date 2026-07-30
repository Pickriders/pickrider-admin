import { SVG } from "@/components/svg";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { Notification } from "./Notification";
import { Suspense } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { FontSwitcher } from "./FontSwitcher";
import { MobileNav } from "../MobileNav";

export const Header = () => {
  return (
    <header className="h-[6.2rem] py-3 sm:pl-6 sm:pr-9 px-4 bg-background sticky top-0 z-30 border-b  flex items-center justify-between">
      <div className="flex items-center gap-x-3">
        <MobileNav />
        <Link href={"/dashboard"} className=" pt-2 inline-block mb-0">
          <SVG.LogoIcon />
        </Link>
      </div>
      <div className="flex items-center sm:gap-x-4 gap-x-2">
        <FontSwitcher />
        <ThemeToggle />
        <Suspense>
          <Notification />
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
};
