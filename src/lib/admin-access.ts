"use client";

import { getCookie } from "cookies-next";
import { STORAGE } from "@/constant";

/**
 * Client-side role gating for the admin shell. This only shapes the UI (which sidebar sections
 * render, which pages redirect, which buttons show) — real enforcement is the backend's
 * rolesGuard. The tiers below mirror `PlatformStaffRoles` & friends in backend-api
 * (src/shared/interfaces/user.type.ts); keep the two in step.
 *
 *  - SUPER_ADMIN: everything.
 *  - ADMIN / PLATFORM_ADMIN: everything except moving platform money and settlement accounts.
 *  - PLATFORM_MANAGER: read everything + operational actions + growth (coupons, badges, broadcasts).
 *  - PLATFORM_OPERATION: orders, couriers, vehicles, customers, businesses, support — with actions.
 *  - PLATFORM_FINANCE: finances, transactions, wallet adjustments/refunds; read-only elsewhere.
 */

export type AdminRole =
  "SUPER_ADMIN" | "ADMIN" | "PLATFORM_ADMIN" | "PLATFORM_MANAGER" | "PLATFORM_OPERATION" | "PLATFORM_FINANCE";

export const PLATFORM_STAFF_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PLATFORM_ADMIN",
  "PLATFORM_MANAGER",
  "PLATFORM_OPERATION",
  "PLATFORM_FINANCE",
];

const ADMINS: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN"];
const OPS: AdminRole[] = [...ADMINS, "PLATFORM_MANAGER", "PLATFORM_OPERATION"];
const GROWTH: AdminRole[] = [...ADMINS, "PLATFORM_MANAGER"];
const FINANCE: AdminRole[] = [...ADMINS, "PLATFORM_FINANCE"];
const FINANCE_READ: AdminRole[] = [...FINANCE, "PLATFORM_MANAGER"];
const TREASURY: AdminRole[] = ["SUPER_ADMIN", "PLATFORM_FINANCE"];

/** Which top-level sections each role can open. Unlisted sections are open to all staff. */
const SECTION_ACCESS: Record<string, AdminRole[]> = {
  "/dashboard": PLATFORM_STAFF_ROLES,
  "/analytics": PLATFORM_STAFF_ROLES,
  "/orders": PLATFORM_STAFF_ROLES,
  "/couriers": PLATFORM_STAFF_ROLES,
  "/vehicles": PLATFORM_STAFF_ROLES,
  "/customers": PLATFORM_STAFF_ROLES,
  "/business": PLATFORM_STAFF_ROLES,
  "/support": OPS,
  "/finances": FINANCE_READ,
  "/messaging": PLATFORM_STAFF_ROLES,
  "/delivery-price": PLATFORM_STAFF_ROLES,
  "/coupons": PLATFORM_STAFF_ROLES,
  "/achievements": PLATFORM_STAFF_ROLES,
  "/admin": GROWTH,
};

/** Every gated action in the console, mapped to the roles the backend accepts for it. */
export const ACTION_ROLES = {
  // Orders
  "order.cancel": OPS,
  "order.overrideStatus": GROWTH,
  // People
  "user.status": OPS,
  "user.phone": OPS,
  "user.dispatch": OPS,
  "user.create": ADMINS,
  "licence.review": OPS,
  "wallet.adjust": FINANCE,
  "wallet.refund": FINANCE,
  "wallet.settlementAccount": TREASURY,
  // Vehicles
  "vehicle.review": OPS,
  "vehicle.create": OPS,
  "vehicle.delete": ADMINS,
  // Businesses
  "business.manage": OPS,
  // Finance
  "finance.read": FINANCE_READ,
  "finance.treasury": TREASURY,
  // Growth
  "coupon.manage": GROWTH,
  "badge.manage": GROWTH,
  "broadcast.send": GROWTH,
  // Support
  "support.handle": OPS,
  // Admin section
  "team.create": ADMINS,
  "settings.write": ADMINS,
  "logs.read": GROWTH,
} satisfies Record<string, AdminRole[]>;

export type AdminAction = keyof typeof ACTION_ROLES;

/** Decodes the JWT payload (base64) — no verification needed client-side. */
export function getAdminRoles(): AdminRole[] {
  try {
    const token = getCookie(STORAGE.accessToken)?.toString();
    if (!token) return [];
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { roles?: string[] };
    return (payload.roles ?? []).filter((role): role is AdminRole => (PLATFORM_STAFF_ROLES as string[]).includes(role));
  } catch {
    return [];
  }
}

export function canAccessSection(section: string, roles: AdminRole[]): boolean {
  if (roles.includes("SUPER_ADMIN")) return true;
  const allowed = SECTION_ACCESS[section];
  // Unknown sections stay visible — fail open for UX; the backend still guards.
  if (!allowed) return true;
  return roles.some((role) => allowed.includes(role));
}

export function canAccessPath(pathname: string, roles: AdminRole[]): boolean {
  const section = "/" + (pathname.split("/")[1] ?? "");
  return canAccessSection(section, roles);
}

/** True when any of the roles may perform the action. Empty roles (no token yet) fail open, like sections. */
export function can(action: AdminAction, roles: AdminRole[] = getAdminRoles()): boolean {
  if (roles.length === 0) return true;
  return roles.some((role) => (ACTION_ROLES[action] as AdminRole[]).includes(role));
}

export function canManageCoupons(roles: AdminRole[]): boolean {
  return can("coupon.manage", roles);
}

export function canManageAchievements(roles: AdminRole[]): boolean {
  return can("badge.manage", roles);
}
