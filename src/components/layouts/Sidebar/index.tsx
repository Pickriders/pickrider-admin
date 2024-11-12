"use client";

import { SVG } from "@/components/svg";
import { SidebarLink } from "./SidebarLink";

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
    href: "/customers",
  },
  {
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
  return (
    <aside className="w-[15rem] sticky top-[6.2rem] left-0 bg-background  h-[calc(100vh-6.2rem)] pt-6">
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

// @DEPERICATED DESIGN
// <UI.Container element={"aside"} className={style.sidebar}>
//   <UI.Container className={style.logo}>
//     <SVG.LogoIcon />
//   </UI.Container>

//   <UI.Container element={"ul"} className={`${style.list} custom-scrollbar`}>
//     <SidebarLink
//       path="/dashboard"
//       label="dashboard"
//       icon={<SVG.CategoryIcon />}
//     />
//     <SidebarLink
//       path="/dashboard/customers"
//       label="Customers"
//       icon={<SVG.PersonGropBoldIcon />}
//     />
//     <SidebarLink
//       path="/dashboard/inventory"
//       label="Inventory"
//       icon={<SVG.CategoryIcon />}
//     />
//     <SidebarLink
//       path="/dashboard/business-management"
//       label="Business Management"
//       icon={<SVG.CategoryIcon />}
//     />
//     <SidebarLink
//       path="/dashboard/couriers"
//       label="Couriers"
//       icon={<SVG.PersonAcceptIcon />}
//     />
//     <SidebarLink
//       path="/dashboard/kyb-management"
//       label="KYB Management"
//       icon={<SVG.MenuSubIcon />}
//     />
//     <SidebarLink
//       path="payout/charges"
//       label="Payout/Charges"
//       icon={<SVG.DocumentIcon />}
//     />
//     <SidebarLink
//       path="cards&payments"
//       label="Cards & payments"
//       icon={<SVG.AirpodIcon />}
//     />
//     <SidebarLink
//       path="transactions"
//       label="transactions"
//       icon={<SVG.ReceiptIcon />}
//     />
//     <SidebarLink path="orders" label="Orders" icon={<SVG.MenuIcon />} />
//     <SidebarLink
//       path="Reports & Complaints"
//       label="Reports & Complaints"
//       icon={<SVG.ReportIcon />}
//     />
//   </UI.Container>
// </UI.Container>
