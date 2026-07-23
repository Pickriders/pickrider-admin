import { Database, ScrollText, Settings, ShieldCheck, UserPlus } from "lucide-react";
import { NavigationLinks } from "./NavigationLink";

const ITEMS = [
  {
    href: "/admin/add-team-member",
    title: "Add team member",
    description: "Create a new staff account with scoped access.",
    icon: <UserPlus size={20} />,
  },
  {
    href: "/admin/teams-and-permissions",
    title: "Team & permissions",
    description: "Manage platform staff and their roles.",
    icon: <ShieldCheck size={20} />,
  },
  {
    href: "/admin/app-settings",
    title: "App settings",
    description: "Countries, states, pricing and dispatch knobs.",
    icon: <Settings size={20} />,
  },
  {
    href: "/admin/audit-log",
    title: "Audit log",
    description: "Every admin and system action, timestamped.",
    icon: <ScrollText size={20} />,
  },
  {
    href: "/admin/data-log",
    title: "Data log",
    description: "System-level events and payloads.",
    icon: <Database size={20} />,
  },
];

export const SettingsNavigation = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ITEMS.map((item) => (
        <NavigationLinks
          key={item.href}
          href={item.href}
          title={item.title}
          description={item.description}
          headIcon={item.icon}
        />
      ))}
    </div>
  );
};
