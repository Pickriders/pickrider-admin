"use client";

import {
  Bike,
  BarChart3,
  Building2,
  Calculator,
  Car,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  Medal,
  Megaphone,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useAttention } from "@/lib/admin/hooks";
import { canAccessSection, getAdminRoles, type AdminRole } from "@/lib/admin-access";
import { cn } from "@/lib/utils";

/**
 * Grouped navigation. Counts on the right are the things that need a person:
 * licences to review, vehicles to verify, orders nobody has picked up.
 */
type NavItem = { label: string; href: string; icon: LucideIcon; badge?: (a: AttentionCounts) => number | undefined };
type AttentionCounts = { licencesAwaitingReview?: number; vehiclesPendingVerification?: number; ordersAwaitingRiderStale?: number; withdrawalsProcessing?: number; failedNotifications24h?: number; issuesOpen?: number };

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Orders", href: "/orders", icon: ClipboardList, badge: (a) => a.ordersAwaitingRiderStale },
      { label: "Couriers", href: "/couriers", icon: Bike, badge: (a) => a.licencesAwaitingReview },
      { label: "Vehicles", href: "/vehicles", icon: Car, badge: (a) => a.vehiclesPendingVerification },
      { label: "Support", href: "/support", icon: LifeBuoy, badge: (a) => a.issuesOpen },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Business", href: "/business", icon: Building2 },
    ],
  },
  {
    title: "Money and growth",
    items: [
      { label: "Finances", href: "/finances", icon: Wallet, badge: (a) => a.withdrawalsProcessing },
      { label: "Messaging", href: "/messaging", icon: Megaphone, badge: (a) => a.failedNotifications24h },
      { label: "Delivery Price", href: "/delivery-price", icon: Calculator },
      { label: "Coupons", href: "/coupons", icon: Ticket },
      { label: "Achievements", href: "/achievements", icon: Medal },
    ],
  },
  {
    title: "System",
    items: [{ label: "Admin", href: "/admin", icon: ShieldCheck }],
  },
];

/** Flat list, kept for anything that still expects the old shape. */
export const SIDEBAR_LINKS = NAV_GROUPS.flatMap((group) => group.items);

export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const [roles, setRoles] = React.useState<AdminRole[] | null>(null);
  React.useEffect(() => setRoles(getAdminRoles()), []);
  const attention = useAttention();
  const counts = (attention.data ?? {}) as AttentionCounts;

  const visible = (href: string) => roles === null || roles.length === 0 || canAccessSection(href, roles);

  return (
    <nav className="space-y-5 px-3">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => visible(item.href));
        if (!items.length) return null;
        return (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">{group.title}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badge = item.badge?.(counts);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                        active ? "bg-ink text-card shadow-card" : "text-ink-muted hover:bg-surface hover:text-ink",
                      )}
                    >
                      <Icon size={18} strokeWidth={active ? 2.4 : 2} className="shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                            active ? "bg-card/20 text-card" : "bg-warning-soft text-warning",
                          )}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
};

export const Sidebar = () => {
  return (
    <aside className="admin-scroll sticky left-0 top-[4.5rem] h-[calc(100vh-4.5rem)] w-[15.5rem] overflow-y-auto border-r border-line bg-card py-5">
      <SidebarNav />
    </aside>
  );
};
