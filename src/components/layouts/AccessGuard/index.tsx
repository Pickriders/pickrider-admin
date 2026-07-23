"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath, getAdminRoles } from "@/lib/admin-access";

/**
 * Redirects restricted roles away from sections they can't open. UI-level only
 * — the backend guards remain the real enforcement.
 */
export const AccessGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = React.useState(true);

  React.useEffect(() => {
    const roles = getAdminRoles();
    const ok = roles.length === 0 || canAccessPath(pathname, roles);
    setAllowed(ok);
    if (!ok) router.replace("/dashboard");
  }, [pathname, router]);

  if (!allowed) return null;
  return <>{children}</>;
};
