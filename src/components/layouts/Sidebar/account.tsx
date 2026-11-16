"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { ACCOUNT_LINKS } from "../Header/UserMenu";
import { useQueryModal } from "@/hooks";
import { useMe } from "@/lib/admin/hooks";
import { formatEmail, formatPersonName } from "@/lib/admin/person";
import { staffRoleLabel } from "@/lib/admin/roles";
import { cn } from "@/lib/utils";

/**
 * Who is signed in, pinned to the bottom of the sidebar (and the mobile drawer), like the
 * storefront admin: avatar, name and role open the account shortcuts; the icon logs out.
 * Folds to the avatar and the icon on the collapsed rail.
 */
export const SidebarAccount = ({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => {
  const { setParam } = useQueryModal();
  const { data, isLoading } = useMe();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const initials = `${data?.firstname?.charAt(0) ?? ""}${data?.lastname?.charAt(0) ?? ""}` || "A";
  const fullName = formatPersonName(`${data?.firstname ?? ""} ${data?.lastname ?? ""}`) || "Admin";
  const role = staffRoleLabel(data?.roles);
  const logout = () => {
    setOpen(false);
    onNavigate?.();
    setParam("logout", "true");
  };

  return (
    <div className="shrink-0 border-t border-line p-2.5">
      <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "gap-1.5")}>
        <div ref={ref} className={cn("relative min-w-0", !collapsed && "flex-1")}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={open}
            title={collapsed ? fullName : undefined}
            aria-label={collapsed ? `Account: ${fullName}` : undefined}
            className={cn(
              "flex w-full min-w-0 items-center rounded-xl text-left transition-colors hover:bg-surface",
              collapsed ? "justify-center p-1" : "gap-3 p-1.5",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold uppercase text-card">
              {isLoading ? "" : initials}
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-bold text-ink">{isLoading ? "Loading" : fullName}</span>
                <span className="block truncate text-[11px] text-ink-faint">{role ?? formatEmail(data?.email)}</span>
              </span>
            ) : null}
          </button>

          {open ? (
            <div
              role="menu"
              className={cn(
                "absolute bottom-full z-40 mb-2 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-card",
                collapsed ? "left-0 w-52" : "inset-x-0",
              )}
            >
              <div className="px-2.5 pb-2 pt-1.5">
                <p className="truncate text-sm font-semibold text-ink">{fullName}</p>
                <p className="truncate text-xs text-ink-muted">{formatEmail(data?.email)}</p>
              </div>
              <div className="my-1 h-px bg-line" />
              {ACCOUNT_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-ink hover:bg-surface"
                  >
                    <Icon size={15} className="text-ink-muted" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-danger hover:bg-danger-soft"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={logout}
          title="Log out"
          aria-label="Log out"
          className="grid size-9 shrink-0 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <LogOut size={17} />
        </button>
      </div>
    </div>
  );
};
