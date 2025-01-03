"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import Link from "next/link";

export const UserMenu = () => {
  const { setParam } = useQueryModal();

  return (
    <UI.DropdownMenu>
      <UI.DropdownMenuTrigger asChild>
        <div role="button" className="flex items-center gap-x-2.5">
          <div className="size-[2.3rem] font-clash-display rounded-full bg-primary-black text-white text-lg grid place-items-center font-semibold">
            P
          </div>
          <div>
            <span className="font-clash-display font-semibold text-sm ">
              Nnamani Kester
            </span>
            <p className="text-xs text-primary-gray">example@gmail.com</p>
          </div>
          <span>
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
