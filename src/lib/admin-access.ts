"use client";

import { getCookie } from "cookies-next";
import { STORAGE } from "@/constant";

/**
 * Client-side role gating for the admin shell. This only shapes the UI (which
 * sidebar sections render, which pages redirect) — real enforcement stays on
 * the backend guards (JwtAdminGuard + rolesGuard). Roles come from the JWT the
 * core API issued at login.
 */

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PLATFORM_ADMIN"
  | "PLATFORM_MANAGER"
  | "PLATFORM_OPERATION"
  | "PLATFORM_FINANCE";

export const PLATFORM_STAFF_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PLATFORM_ADMIN",
  "PLATFORM_MANAGER",
  "PLATFORM_OPERATION",
  "PLATFORM_FINANCE",
];

// Roles that see everything.
const FULL_ACCESS: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN", "PLATFORM_MANAGER"];

/**
 * Which top-level sections each restricted role can open. Sections not listed
 * for a role are hidden from its sidebar and redirected away from.
 */
const SECTION_ACCESS: Record<string, AdminRole[]> = {
  "/dashboard": PLATFORM_STAFF_ROLES,
  "/customers": [...FULL_ACCESS, "PLATFORM_OPERATION"],
  "/business": [...FULL_ACCESS, "PLATFORM_OPERATION"],
  "/couriers": [...FULL_ACCESS, "PLATFORM_OPERATION"],
  "/vehicles": [...FULL_ACCESS, "PLATFORM_OPERATION"],
  "/finances": [...FULL_ACCESS, "PLATFORM_FINANCE"],
  "/orders": [...FULL_ACCESS, "PLATFORM_OPERATION", "PLATFORM_FINANCE"],
  "/admin": ["SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN"],
};

/** Decodes the JWT payload (base64) — no verification needed client-side. */
export function getAdminRoles(): AdminRole[] {
  try {
    const token = getCookie(STORAGE.accessToken)?.toString();
    if (!token) return [];
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { roles?: string[] };
    return (payload.roles ?? []).filter((role): role is AdminRole =>
      (PLATFORM_STAFF_ROLES as string[]).includes(role),
    );
  } catch {
    return [];
  }
}

export function canAccessSection(section: string, roles: AdminRole[]): boolean {
  if (roles.some((role) => FULL_ACCESS.includes(role))) return true;
  const allowed = SECTION_ACCESS[section];
  // Unknown sections stay visible — fail open for UX; the backend still guards.
  if (!allowed) return true;
  return roles.some((role) => allowed.includes(role));
}

export function canAccessPath(pathname: string, roles: AdminRole[]): boolean {
  const section = "/" + (pathname.split("/")[1] ?? "");
  return canAccessSection(section, roles);
}
