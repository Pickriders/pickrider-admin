"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react";
import { SVG } from "@/components/svg";
import { SidebarLink } from "./SidebarLink";
import { canAccessSection, getAdminRoles, type AdminRole } from "@/lib/admin-access";

export const SIDEBAR_LINKS = [
  {
    activeIcon: <SVG.HomeIconFill />,
    icon: <SVG.HomeIcon />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    activeIcon: <BarChart3 size={21} strokeWidth={2.4} />,
    icon: <BarChart3 size={21} />,
    label: "Analytics",
    href: "/analytics",
  },
  {
    activeIcon: <SVG.PersonGroupBoldFillIcon width={25} height={25} />,
    icon: <SVG.PersonGropBoldIcon />,
    label: "Customers",
    href: "/customers",
  },
  {
    activeIcon: <SVG.PeopleGroupFill width={23} height={17} />,
    icon: <SVG.PepleGroup />,
    label: "Business",
    href: "/business",
  },
  {
    activeIcon: <SVG.PersonAcceptFillIcon width={23} height={17} />,
    icon: <SVG.PersonAcceptIcon />,
    label: "Couriers",
    href: "/couriers",
  },
  {
    activeIcon: <SVG.CategoryFill />,
    icon: <SVG.CategoryIcon />,
    label: "Vehicles",
    href: "/vehicles",
  },
  {
    activeIcon: <SVG.CardFill />,
    icon: <SVG.Card />,
    label: "Finances",
    href: "/finances",
  },
  {
    activeIcon: <SVG.MenuIcon className="fill-white" />,
    icon: <SVG.MenuIcon />,
    label: "Orders",
    href: "/orders",
  },
  {
    activeIcon: <SVG.ShieldKeyFill />,
    icon: <SVG.ShieldKey />,
    label: "Admin",
    href: "/admin",
  },
];

/**
 * Nav list filtered by the signed-in admin's roles. Roles are read from the
 * JWT after mount; until then all links render so full-access admins (the
 * common case) never see a flash.
 */
export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const [roles, setRoles] = React.useState<AdminRole[] | null>(null);
  React.useEffect(() => setRoles(getAdminRoles()), []);

  const links =
    roles === null || roles.length === 0
      ? SIDEBAR_LINKS
      : SIDEBAR_LINKS.filter((link) => canAccessSection(link.href, roles));

  return (
    <ul className="max-h-full">
      {links.map((link) => (
        <li key={link.href}>
          <SidebarLink
            path={link.href}
            label={link.label}
            icon={link.icon}
            activeIcon={link.activeIcon}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-[15rem] sticky top-[6.2rem] left-0 bg-background border-r  h-[calc(100vh-6.2rem)] pt-6">
      <SidebarNav />
    </aside>
  );
};
