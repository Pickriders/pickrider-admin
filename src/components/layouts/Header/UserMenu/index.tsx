import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";

export const UserMenu = () => {
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
        <UI.DropdownMenuItem>
          <div className="flex items-center gap-x-2 text-sm font-montserrat font-semibold text-primary-gray">
            <SVG.PersonEdit />
            Profile
          </div>
        </UI.DropdownMenuItem>
        <UI.DropdownMenuItem>
          <div className="flex items-center gap-x-2 text-sm font-semibold font-montserrat text-primary-gray">
            <SVG.LockIcon />
            Reset Password
          </div>
        </UI.DropdownMenuItem>
        <UI.DropdownMenuItem asChild>
          <Link
            href={"?logout=true"}
            className="flex items-center gap-x-2 text-sm font-montserrat font-semibold text-primary-gray"
          >
            <SVG.LogoutIcon />
            Logout
          </Link>
        </UI.DropdownMenuItem>
      </UI.DropdownMenuContent>
    </UI.DropdownMenu>
  );
};
