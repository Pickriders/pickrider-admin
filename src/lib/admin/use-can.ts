"use client";

import { useEffect, useState } from "react";

import { can, getAdminRoles, type AdminAction, type AdminRole } from "@/lib/admin-access";

/**
 * Roles from the session cookie, read after mount so server and client render the same
 * first frame. Returns a `can(action)` that fails open until the roles are known (the
 * backend still refuses anything the role may not do).
 */
export function useCan() {
  const [roles, setRoles] = useState<AdminRole[] | null>(null);
  useEffect(() => setRoles(getAdminRoles()), []);
  return {
    roles: roles ?? [],
    ready: roles !== null,
    can: (action: AdminAction) => (roles === null ? true : can(action, roles)),
  };
}
