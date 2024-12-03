"use client";

import { SVG } from "@/components/svg";
import { SidebarLink } from "./SidebarLink";
import { useTheme } from "next-themes";

const SIDEBAR_LINKS = [
  {
    activeIcon: <SVG.HomeIconFill />,
    icon: <SVG.HomeIcon />,
    label: "Dashboard",
    href: "/dashboard",
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
    icon: <SVG.PersonAcceptIcon />,
    label: "Couriers",
    href: "/couriers",
  },
  {
    icon: <SVG.CategoryIcon />,
    label: "Inventory",
    href: "/inventory",
  },
  {
    icon: <SVG.AirpodIcon />,
    label: "Finances",
    href: "/finances",
  },
  {
    icon: <SVG.MenuIcon />,
    label: "Orders",
    href: "/orders",
  },
  {
    icon: <SVG.ReportIcon />,
    label: "Reports & Complaints",
    href: "/reports",
  },
];

export const Sidebar = () => {
  const { setTheme } = useTheme();
  return (
    <aside className="w-[15rem] sticky top-[6.2rem] left-0 bg-background border-r  h-[calc(100vh-6.2rem)] pt-6">
      <ul className=" max-h-full ">
        {SIDEBAR_LINKS.map((link, i) => {
          return (
            <li key={i}>
              <SidebarLink
                path={link.href}
                label={link.label}
                icon={link.icon}
                activeIcon={link.activeIcon}
              />
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
