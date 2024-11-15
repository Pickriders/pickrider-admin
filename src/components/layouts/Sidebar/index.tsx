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
    icon: <SVG.PersonGropBoldIcon />,
    label: "Customers",
    href: "/dashboard/customers",
  },
  {
    icon: <SVG.PepleGroup />,
    label: "Business",
    href: "/dashboard/business",
  },
  {
    icon: <SVG.PersonAcceptIcon />,
    label: "Couriers",
    href: "/dashboard/couriers",
  },
  {
    icon: <SVG.CategoryIcon />,
    label: "Inventory",
    href: "/dashboard/inventory",
  },
  {
    icon: <SVG.AirpodIcon />,
    label: "Finances",
    href: "/dashboard/finances",
  },
  {
    icon: <SVG.MenuIcon />,
    label: "Orders",
    href: "/dashboard/orders",
  },
  {
    icon: <SVG.ReportIcon />,
    label: "Reports & Complaints",
    href: "/dashboard/reports",
  },
];

export const Sidebar = () => {
  const { setTheme } = useTheme();
  return (
    <aside className="w-[15rem] sticky top-[6.2rem] left-0 bg-background  h-[calc(100vh-6.2rem)] pt-6">
      {/* <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("dark")}>dark</button> */}
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
