"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "../Sidebar";
import { cn } from "@/lib/utils";

/** Hamburger + slide-in drawer for < xl screens. Same nav as the sidebar. */
export const MobileNav = () => {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close whenever the route changes (covers browser back/forward too).
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="size-9 grid place-items-center rounded-lg border bg-background text-primary-gray"
      >
        <Menu size={19} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[16rem] max-w-[85vw] bg-background border-r shadow-xl transition-transform duration-200 flex flex-col",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 h-[4.5rem] border-b">
            <span className="font-clash-display font-semibold">Menu</span>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="size-8 grid place-items-center rounded-lg text-primary-gray hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto pt-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      </div>
    </div>
  );
};
