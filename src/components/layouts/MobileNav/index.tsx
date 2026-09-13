"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";

import { SVG } from "@/components/svg";
import { cn } from "@/lib/utils";

import { SidebarNav } from "../Sidebar";

/**
 * Hamburger + slide-in drawer for < xl screens, same nav as the sidebar. The
 * drawer portals to body: the header uses backdrop-blur, and a backdrop filter
 * makes its element the containing block for fixed children, which trapped the
 * drawer inside the header bar.
 */
export const MobileNav = () => {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setMounted(true), []);

  // Close whenever the route changes (covers browser back/forward too).
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const drawer = (
    <div
      className={cn("fixed inset-0 z-[70] bg-black/50 transition-opacity duration-200 xl:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      onClick={() => setOpen(false)}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-line bg-card shadow-pop transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5">
          <SVG.PickridersLogo className="h-8 w-auto" />
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="admin-scroll flex-1 overflow-y-auto py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </nav>
      </div>
    </div>
  );

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-ink-muted hover:text-ink"
      >
        <Menu size={20} />
      </button>
      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
};
