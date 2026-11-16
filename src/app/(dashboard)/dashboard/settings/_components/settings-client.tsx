"use client";

import {
  KeyRound,
  Palette,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { PageHeader, Tabs } from "@/components/kit";
import {
  DEFAULT_SETTINGS_TAB,
  PLATFORM_SECTION,
  isPlatformTab,
  visibleSettingsTabs,
  type SettingsTab,
} from "@/lib/admin/settings-tabs";
import { canAccessSection, getAdminRoles } from "@/lib/admin-access";
import { useTabParam } from "@/lib/admin/url-state";

import { AuditTab } from "../../../admin/_components/audit-tab";
import { DataLogTab } from "../../../admin/_components/data-log-tab";
import { SettingsTab as AppSettingsTab } from "../../../admin/_components/settings-tab";
import { TeamTab } from "../../../admin/_components/team-tab";

import { AppearanceTab } from "./appearance-tab";
import { PasswordTab } from "./password-tab";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";

/**
 * Settings: your account (profile, appearance, password, security) for everyone, then the
 * platform (team, app settings, audit log, data logs) for roles that could open the old Admin hub.
 * The tab is in `?tab=`, so links and every old account or Admin URL (they redirect here) open the
 * right panel. The tab strip scrolls sideways on a phone.
 */
const META: Record<SettingsTab, { label: string; icon: LucideIcon; description: string }> = {
  profile: { label: "Profile", icon: UserRound, description: "Your photo, your details and what your account can do." },
  appearance: { label: "Appearance", icon: Palette, description: "Theme and font, saved to your profile so they follow you." },
  password: { label: "Password", icon: KeyRound, description: "Change the password you sign in with." },
  security: { label: "Security", icon: ShieldCheck, description: "Your authenticator app, recovery codes and every device signed in to your account." },
  team: { label: "Team", icon: Users, description: "Platform staff, business and developer teams." },
  "app-settings": {
    label: "App settings",
    icon: SlidersHorizontal,
    description: "Countries, states, pricing, dispatch, support emails and referral knobs.",
  },
  audit: { label: "Audit log", icon: ScrollText, description: "Every admin and system request, with what was sent and what came back." },
  logs: { label: "Data logs", icon: Terminal, description: "Structured system logs and errors the API recorded." },
};

const PANELS: Record<SettingsTab, React.ComponentType> = {
  profile: ProfileTab,
  appearance: AppearanceTab,
  password: PasswordTab,
  security: SecurityTab,
  team: TeamTab,
  "app-settings": AppSettingsTab,
  audit: AuditTab,
  logs: DataLogTab,
};

export function SettingsClient() {
  // Read after mount: roles live in the session cookie, which the server render can't see.
  // Until then (null) every tab parses, so `?tab=team` doesn't flash Profile first; its panel waits.
  const [canSeePlatform, setCanSeePlatform] = React.useState<boolean | null>(null);
  React.useEffect(() => setCanSeePlatform(canAccessSection(PLATFORM_SECTION, getAdminRoles())), []);
  const tabs = visibleSettingsTabs(canSeePlatform !== false);
  const [tab, setTab] = useTabParam<SettingsTab>(DEFAULT_SETTINGS_TAB, tabs);
  const Panel = PANELS[tab];

  return (
    <div>
      <PageHeader title="Settings" description={META[tab].description} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={visibleSettingsTabs(canSeePlatform === true).map((id) => {
          const Icon = META[id].icon;
          return {
            id,
            label: (
              <>
                {/* A hairline before the first platform tab separates "you" from "the platform". */}
                {id === "team" ? <span aria-hidden className="-ml-1 mr-1.5 h-4 w-px bg-line" /> : null}
                <Icon size={15} />
                {META[id].label}
              </>
            ),
          };
        })}
      />
      <div role="tabpanel" aria-label={META[tab].label}>
        {isPlatformTab(tab) && canSeePlatform !== true ? null : <Panel />}
      </div>
    </div>
  );
}
