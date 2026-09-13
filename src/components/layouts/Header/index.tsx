import Link from "next/link";
import { Suspense } from "react";

import { SVG } from "@/components/svg";

import { MobileNav } from "../MobileNav";
import { LiveIndicator } from "./LiveIndicator";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between border-b border-line bg-card/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-x-3">
        <MobileNav />
        <Link href="/dashboard" aria-label="Pickriders dashboard" className="inline-flex items-center">
          <SVG.PickridersLogo className="h-8 w-auto sm:h-9" />
        </Link>
      </div>
      <div className="flex items-center gap-x-2 sm:gap-x-3">
        <LiveIndicator />
        <ThemeToggle />
        <Suspense>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
};
