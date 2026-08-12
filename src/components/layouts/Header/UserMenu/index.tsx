"use client";

import { useGetUserQuery } from "@/api";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import Image from "next/image";
import Link from "next/link";

export const UserMenu = () => {
  const { setParam } = useQueryModal();
  const { data, isLoading } = useGetUserQuery();

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

  return (
    <UI.DropdownMenu>
      <UI.DropdownMenuTrigger asChild>
        <div role="button" className="flex items-center gap-x-2.5">
          <div className="size-[2.3rem] shrink-0 font-clash-display rounded-full bg-primary-black text-white text-md grid place-items-center font-semibold uppercase">
            {data?.firstname.charAt(0)}
            {data?.lastname.charAt(0)}
          </div>
          <div className="hidden min-w-0 text-left md:block">
            <span className="block truncate font-clash-display font-semibold text-sm">
              {data?.firstname} {data?.lastname}
            </span>
            <p className="truncate text-xs text-primary-gray">{data?.email}</p>
          </div>
          <span className="hidden md:inline">
            <SVG.ChevronDown />
          </span>
        </div>
      </UI.DropdownMenuTrigger>
      <UI.DropdownMenuContent sideOffset={20} className="w-[215px]">
        <UI.DropdownMenuItem asChild>
          <Link
            href={"/dashboard/profile"}
            className="flex items-center gap-x-2 text-sm font-montserrat font-semibold text-primary-gray"
          >
            <SVG.PersonEdit />
            Profile
          </Link>
        </UI.DropdownMenuItem>
        <UI.DropdownMenuItem asChild>
          <Link
            href={"/dashboard/change-password"}
            className="flex items-center gap-x-2 text-sm font-semibold font-montserrat text-primary-gray"
          >
            <SVG.LockIcon />
            Reset Password
          </Link>
        </UI.DropdownMenuItem>
        <UI.DropdownMenuItem
          onClick={() => setParam("logout", "true")}
          className="flex items-center gap-x-2 text-sm font-montserrat font-semibold text-primary-gray"
        >
          <SVG.LogoutIcon />
          Logout
        </UI.DropdownMenuItem>
      </UI.DropdownMenuContent>
    </UI.DropdownMenu>
  );
};
