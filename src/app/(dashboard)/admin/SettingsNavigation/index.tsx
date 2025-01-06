import { SVG } from "@/components/svg";
import Link from "next/link";
import { NavigationLinks } from "./NavigationLink";

export const SettingsNavigation = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/*  Add Team Member */}
      <NavigationLinks
        bgPatternIcon={<SVG.UserSwitchIcon />}
        headIcon={<SVG.AddUserIcon />}
        href="/admin/add-team-member"
        title=" Add Team Member"
      />

      {/*  Permissions */}
      <NavigationLinks
        bgPatternIcon={<SVG.Shield />}
        headIcon={<SVG.UserShield />}
        href="/admin/terms-and-permissions"
        title="Permissions"
      />

      {/* App Settings */}
      <NavigationLinks
        headIcon={<SVG.AppSettingicon />}
        bgPatternIcon={<SVG.SettingsIcon />}
        href="/admin/app-settings"
        title="App Settings"
      />

      {/* Audit Log */}
      <NavigationLinks
        headIcon={<SVG.ArchiveIcon />}
        bgPatternIcon={<SVG.ArchivesSettingIcon />}
        href="/admin/audit-log"
        title="Audit Log"
      />

      {/* Data Log */}
      <NavigationLinks
        headIcon={<SVG.Cloudicon />}
        bgPatternIcon={<SVG.DataBaseicon />}
        href="/admin/data-log"
        title=" Data Log"
      />
    </div>
  );
};
