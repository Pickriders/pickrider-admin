import { SVG } from "../../svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export const UserMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={20} className="w-[215px]">
        <DropdownMenuItem>
          <div className="flex items-center gap-x-2 text-sm font-semibold text-primary-gray">
            <SVG.PersonEdit />
            Profile
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center gap-x-2 text-sm font-semibold text-primary-gray">
            <SVG.LockIcon />
            Reset Password
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center gap-x-2 text-sm font-semibold text-primary-gray">
            <SVG.LogoutIcon />
            Logout
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
