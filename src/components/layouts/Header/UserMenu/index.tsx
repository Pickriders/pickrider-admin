"use client";

import { useMe } from "@/lib/admin/hooks";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { LogOut, UserRound, KeyRound } from "lucide-react";
import Link from "next/link";

export const UserMenu = () => {
  const { setParam } = useQueryModal();
  const { data, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="flex items-center gap-x-2 md:w-[10rem]">
        <UI.Skeleton className="size-[2.3rem] rounded-full shrink-0" />
        <div className="hidden w-full space-y-1 md:block">
          <UI.Skeleton className="h-3 w-full rounded-2xl" />
          <UI.Skeleton className="h-3 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const initials = `${data?.firstname?.charAt(0) ?? ""}${data?.lastname?.charAt(0) ?? ""}`;
  const fullName = `${data?.firstname ?? ""} ${data?.lastname ?? ""}`.trim();

  return (
    <UI.DropdownMenu>
      <UI.DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center gap-x-2.5 rounded-full md:rounded-xl md:border md:border-line md:bg-card md:py-1.5 md:pl-1.5 md:pr-3 transition-colors hover:md:bg-muted/60"
        >
          <div className="size-[2.3rem] shrink-0 rounded-full bg-ink text-card text-md grid place-items-center font-semibold uppercase">
            {initials}
          </div>
          <div className="hidden min-w-0 text-left md:block">
            <span className="block truncate font-semibold text-sm leading-tight">
              {fullName}
            </span>
            <p className="truncate text-xs text-ink-muted leading-tight">{data?.email}</p>
          </div>
          <span className="hidden text-ink-muted md:inline">
            <SVG.ChevronDown />
          </span>
        </div>
      </UI.DropdownMenuTrigger>

      <UI.DropdownMenuContent
        align="end"
        sideOffset={12}
        collisionPadding={12}
        className="w-[16rem] max-w-[calc(100vw-1.5rem)] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-4">
          <div className="size-11 shrink-0 rounded-full bg-ink text-card grid place-items-center font-semibold uppercase">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm text-foreground">
              {fullName || "Admin"}
            </p>
            <p className="truncate text-xs text-ink-muted">{data?.email}</p>
          </div>
        </div>

        {/* Items */}
        <div className="p-1.5">
          <UI.DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-semibold text-ink-muted focus:bg-muted focus:text-foreground cursor-pointer"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground">
                <UserRound size={16} />
              </span>
              Profile and appearance
            </Link>
          </UI.DropdownMenuItem>

          <UI.DropdownMenuItem asChild>
            <Link
              href="/dashboard/change-password"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-semibold text-ink-muted focus:bg-muted focus:text-foreground cursor-pointer"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground">
                <KeyRound size={16} />
              </span>
              Change password
            </Link>
          </UI.DropdownMenuItem>

          <div className="my-1 h-px bg-border" />

          <UI.DropdownMenuItem
            onClick={() => setParam("logout", "true")}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-semibold text-danger focus:bg-danger-soft focus:text-danger cursor-pointer"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-danger-soft text-danger">
              <LogOut size={16} />
            </span>
            Logout
          </UI.DropdownMenuItem>
        </div>
      </UI.DropdownMenuContent>
    </UI.DropdownMenu>
  );
};
