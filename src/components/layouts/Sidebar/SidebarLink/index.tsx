"use client";

import Link from "next/link";
import { SVG } from "@/components/svg";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LinkProps } from "../Sidebar.type";

export const SidebarLink = ({ path, icon, label, activeIcon, onNavigate }: LinkProps) => {
  const pathname = usePathname();
  const active = pathname.startsWith(`${path}`);

  return (
    <Link
      href={path}
      onClick={onNavigate}
      className={cn(
        "px-6 py-4 font-clash-display transition-colors duration-300 relative font-medium  flex items-center gap-x-4",
        active
          ? "bg-primary-black text-primary text-white"
          : "hover:bg-primary-foreground text-primary-gray"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <SVG.SelectorIcon />
        </span>
      )}

      {active ? <span>{activeIcon}</span> : <span>{icon}</span>}

      <span className={"text-sm "}>{label}</span>
    </Link>
  );
};
