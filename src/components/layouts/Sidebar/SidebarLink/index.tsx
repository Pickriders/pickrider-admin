"use client";

import Link from "next/link";
import { SVG } from "@/components/svg";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LinkProps } from "../Sidebar.type";

export const SidebarLink = ({ path, icon, label, activeIcon, onNavigate }: LinkProps) => {
  const pathname = usePathname();
  // Match the exact section or any of its sub-routes (e.g. /orders/analysis),
  // but only on a segment boundary so sibling sections never both light up.
  const active = pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Link
      href={path}
      prefetch
      onClick={onNavigate}
      className={cn(
        "px-6 py-4 font-clash-display relative font-medium flex items-center gap-x-4",
        active ? "bg-primary-black text-white" : "text-primary-gray hover:bg-primary-foreground transition-colors"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <SVG.SelectorIcon />
        </span>
      )}

      <span>{active ? activeIcon : icon}</span>

      <span className="text-sm">{label}</span>
    </Link>
  );
};
