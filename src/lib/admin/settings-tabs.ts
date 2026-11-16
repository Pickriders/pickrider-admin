/**
 * The one Settings page: your account (profile, appearance, password, security) for every staff
 * member, then the platform (team, app settings, audit log, data logs) for roles that used to
 * reach the Admin hub. The tab is in `?tab=`. The old account pages and every old Admin URL
 * redirect here, so bookmarks and the links in "new sign-in" emails keep landing on the right panel.
 */
export const SETTINGS_PATH = "/dashboard/settings";

export const ACCOUNT_TABS = ["profile", "appearance", "password", "security"] as const;
export const PLATFORM_TABS = ["team", "app-settings", "audit", "logs"] as const;
export const SETTINGS_TABS = [...ACCOUNT_TABS, ...PLATFORM_TABS] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];
export type PlatformTab = (typeof PLATFORM_TABS)[number];

/** The section whose access decides the platform tabs (the old Admin hub's gate). */
export const PLATFORM_SECTION = "/admin";

export function isPlatformTab(value: unknown): value is PlatformTab {
  return typeof value === "string" && (PLATFORM_TABS as readonly string[]).includes(value);
}

/** The tabs this person sees: their account always, the platform only with access to it. */
export function visibleSettingsTabs(canSeePlatform: boolean): readonly SettingsTab[] {
  return canSeePlatform ? SETTINGS_TABS : ACCOUNT_TABS;
}

/** Profile is the default, so it carries no `?tab=` (useTabParam drops the fallback too). */
export const DEFAULT_SETTINGS_TAB: SettingsTab = "profile";

export function isSettingsTab(value: unknown): value is SettingsTab {
  return typeof value === "string" && (SETTINGS_TABS as readonly string[]).includes(value);
}

type QueryValue = string | string[] | undefined;

/** A link to one tab, with any extra query (e.g. `setup=1`) kept after it. */
export function settingsHref(tab: SettingsTab = DEFAULT_SETTINGS_TAB, extra: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams();
  if (tab !== DEFAULT_SETTINGS_TAB) search.set("tab", tab);
  for (const [key, value] of Object.entries(extra)) {
    if (key === "tab" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== "") search.append(key, item);
    }
  }
  const query = search.toString();
  return query ? `${SETTINGS_PATH}?${query}` : SETTINGS_PATH;
}

/** The pages that used to stand alone, and the tab each now lives on. */
export const LEGACY_SETTINGS_ROUTES: Record<string, SettingsTab> = {
  "/dashboard/profile": "profile",
  "/dashboard/change-password": "password",
  "/dashboard/security": "security",
};

/** The old Admin hub's `?tab=` values and the Settings tab each now lives on. */
const ADMIN_HUB_TABS: Record<string, PlatformTab> = {
  team: "team",
  settings: "app-settings",
  audit: "audit",
  logs: "logs",
};

/**
 * Where an old Admin hub URL goes now: its tab mapped across (Team by default), and the rest of
 * the query kept, so `?member=`, `?country=`, `?add=` still open the same drawer.
 */
export function adminHubRedirect(query: Record<string, QueryValue> = {}): string {
  const raw = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  return settingsHref(ADMIN_HUB_TABS[raw ?? ""] ?? "team", query);
}

/**
 * Where an old account URL goes now. Its query string comes along (the grace banner's
 * `?setup=1` still opens the authenticator setup), except a stale `tab`.
 */
export function legacySettingsRedirect(path: string, query: Record<string, QueryValue> = {}): string {
  const tab = LEGACY_SETTINGS_ROUTES[path.replace(/\/+$/, "")] ?? DEFAULT_SETTINGS_TAB;
  return settingsHref(tab, query);
}
