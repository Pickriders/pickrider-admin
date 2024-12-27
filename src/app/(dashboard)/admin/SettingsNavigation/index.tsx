import { SVG } from "@/components/svg";
import Link from "next/link";
import {
  AddUser,
  AppSettingicon,
  ArchiveIcon,
  ArchivesSettingIcon,
  Cloudicon,
  DataBaseicon,
  SettingsIcon,
  Shield,
  UserShield,
  UserSwitchIcon,
} from "./Svgs";

export const SettingsNavigation = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/*  Add Team Member */}
      <Link
        href={"/admin/add-team-member"}
        className=" setting-nav-card z-10 relative h-[8.2rem] bg-primary-black  flex items-center justify-between pr-[2.3rem] pl-5 rounded-lg border"
      >
        <div>
          <AddUser />
          <h2 className="font-clash-display  mt-1.5 font-semibold text-white">
            Add Team Member
          </h2>
        </div>
        <button className="  grid place-items-center top-1/2 bg-[#27272a]  size-[1.7rem] right-6 rounded-full">
          <SVG.ChevronRightIcon className="fill-white" />
        </button>
        <div className="absolute right-0 -z-10">
          <UserSwitchIcon />
        </div>
      </Link>
      {/*  Permissions */}
      <Link
        href={"/admin/permissions"}
        className=" z-10 setting-nav-card relative h-[8.2rem] bg-primary-black  flex items-center justify-between pr-[2.3rem] pl-5 rounded-lg border"
      >
        <div>
          <UserShield />
          <h2 className="font-clash-display text-white mt-1.5 font-semibold">
            Permissions
          </h2>
        </div>
        <button className="  grid place-items-center top-1/2 bg-[#27272a]  size-[1.7rem] right-6 rounded-full">
          <SVG.ChevronRightIcon className="fill-white" />
        </button>
        <div className="absolute right-0 -z-10">
          <Shield />
        </div>
      </Link>
      {/* App Settings */}
      <Link
        href={"/admin/app-settings"}
        className=" setting-nav-card z-10 relative h-[8.2rem] bg-primary-black  flex items-center justify-between pr-[2.3rem] pl-5 rounded-lg border"
      >
        <div>
          <AppSettingicon />
          <h2 className="font-clash-display text-white mt-1.5 font-semibold">
            App Settings
          </h2>
        </div>
        <button className="  grid place-items-center top-1/2 bg-[#27272a]  size-[1.7rem] right-6 rounded-full">
          <SVG.ChevronRightIcon className="fill-white" />
        </button>
        <div className="absolute right-0 -z-10">
          <SettingsIcon />
        </div>
      </Link>
      {/* Audit Log */}
      <Link
        href={"/admin/audit-log"}
        className=" setting-nav-card z-10 relative h-[8.2rem] bg-primary-black  flex items-center justify-between pr-[2.3rem] pl-5 rounded-lg border"
      >
        <div>
          <ArchiveIcon />
          <h2 className="font-clash-display text-white mt-1.5 font-semibold">
            Audit Log
          </h2>
        </div>
        <button className="  grid place-items-center top-1/2 bg-[#27272a]  size-[1.7rem] right-6 rounded-full">
          <SVG.ChevronRightIcon className="fill-white" />
        </button>
        <div className="absolute right-0 -z-10">
          <ArchivesSettingIcon />
        </div>
      </Link>
      {/* Data Log */}
      <Link
        href={"/admin/data-log"}
        className=" setting-nav-card z-10 relative h-[8.2rem] bg-primary-black  flex items-center justify-between pr-[2.3rem] pl-5 rounded-lg border"
      >
        <div>
          <Cloudicon />
          <h2 className="font-clash-display text-white mt-1.5 font-semibold">
            Data Log
          </h2>
        </div>
        <button className="  grid place-items-center top-1/2 bg-[#27272a]  size-[1.7rem] right-6 rounded-full">
          <SVG.ChevronRightIcon className="fill-white" />
        </button>
        <div className="absolute right-0 -z-10">
          <DataBaseicon />
        </div>
      </Link>
    </div>
  );
};
