"use client";

import {
  Bike,
  ChevronLeft,
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

/**
 * `collapsed`: the icon-only rail (desktop). Labels move to a hover tooltip, group
 * titles become a thin divider, and counts shrink to a dot on the icon. The mobile
 * drawer always uses the full list.
 */
export const SidebarNav = ({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) => {
  const pathname = usePathname();
  const [roles, setRoles] = React.useState<AdminRole[] | null>(null);
  React.useEffect(() => setRoles(getAdminRoles()), []);
  const attention = useAttention();
  const counts = (attention.data ?? {}) as AttentionCounts;

  const visible = (href: string) => roles === null || roles.length === 0 || canAccessSection(href, roles);

  return (
    <nav className={cn(collapsed ? "space-y-3 px-2.5" : "space-y-5 px-3")}>
      {NAV_GROUPS.map((group, groupIndex) => {
        const items = group.items.filter((item) => visible(item.href));
        if (!items.length) return null;
        return (
          <div key={group.title}>
            {collapsed ? (
              groupIndex > 0 ? <span aria-hidden className="mx-auto mb-3 block h-px w-6 bg-line" /> : null
            ) : (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">{group.title}</p>
            )}
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
                      title={collapsed ? (badge ? `${item.label} (${badge})` : item.label) : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center rounded-xl text-sm font-semibold transition-colors",
                        collapsed ? "mx-auto h-11 w-11 justify-center" : "gap-3 px-3 py-2.5",
                        active ? "bg-ink text-card shadow-card" : "text-ink-muted hover:bg-surface hover:text-ink",
                      )}
                    >
                      <Icon size={18} strokeWidth={active ? 2.4 : 2} className="shrink-0" />
                      {collapsed ? (
                        badge ? (
                          <span
                            aria-hidden
                            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning ring-2 ring-card"
                          />
                        ) : null
                      ) : (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && badge ? (
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

const COLLAPSE_KEY = "pickriders_admin_sidebar_collapsed";

/**
 * Desktop sidebar that folds to an icon rail, like the storefront admin. The choice is
 * remembered on this device. The toggle sits on the rail's edge, outside the scrolling
 * list so it's never clipped.
 */
export const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage blocked: start expanded */
    }
  }, []);
  const toggle = () =>
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !value;
    });

  return (
    <div className="sticky left-0 top-[4.5rem] h-[calc(100vh-4.5rem)]">
      <aside
        className={cn(
          "admin-scroll h-full overflow-y-auto overflow-x-hidden border-r border-line bg-card py-5 transition-[width] duration-200",
          collapsed ? "w-[4.5rem]" : "w-[15.5rem]",
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </aside>
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-6 z-10 grid h-6 w-6 place-items-center rounded-full border border-line bg-card text-ink-faint shadow-card transition-colors hover:text-ink"
      >
        <ChevronLeft size={13} className={cn("transition-transform duration-200", collapsed && "rotate-180")} />
      </button>
    </div>
  );
};
