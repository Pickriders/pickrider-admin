import {
  ACCOUNT_TABS,
  DEFAULT_SETTINGS_TAB,
  LEGACY_SETTINGS_ROUTES,
  PLATFORM_TABS,
  SETTINGS_TABS,
  adminHubRedirect,
  isPlatformTab,
  visibleSettingsTabs,
  isSettingsTab,
  legacySettingsRedirect,
  settingsHref,
} from "./settings-tabs";

describe("settings tabs", () => {
  it("lists your account first, then the platform, with profile as the default", () => {
    expect(ACCOUNT_TABS).toEqual(["profile", "appearance", "password", "security"]);
    expect(PLATFORM_TABS).toEqual(["team", "app-settings", "audit", "logs"]);
    expect(SETTINGS_TABS).toEqual([...ACCOUNT_TABS, ...PLATFORM_TABS]);
    expect(DEFAULT_SETTINGS_TAB).toBe("profile");
  });

  it("shows the platform tabs only to people who could open the Admin hub", () => {
    expect(visibleSettingsTabs(true)).toEqual(SETTINGS_TABS);
    expect(visibleSettingsTabs(false)).toEqual(ACCOUNT_TABS);
    expect(isPlatformTab("audit")).toBe(true);
    expect(isPlatformTab("security")).toBe(false);
  });

  it("sends every old Admin hub URL to the matching Settings tab, drawers kept", () => {
    expect(adminHubRedirect()).toBe("/dashboard/settings?tab=team");
    expect(adminHubRedirect({ tab: "team", member: "u1" })).toBe("/dashboard/settings?tab=team&member=u1");
    expect(adminHubRedirect({ tab: "settings", country: "ng", add: "state" })).toBe(
      "/dashboard/settings?tab=app-settings&country=ng&add=state",
    );
    expect(adminHubRedirect({ tab: "audit" })).toBe("/dashboard/settings?tab=audit");
    expect(adminHubRedirect({ tab: "logs" })).toBe("/dashboard/settings?tab=logs");
    expect(adminHubRedirect({ tab: "nonsense" })).toBe("/dashboard/settings?tab=team");
  });

  it("recognises only known tab ids", () => {
    expect(isSettingsTab("security")).toBe(true);
    expect(isSettingsTab("team")).toBe(true);
    expect(isSettingsTab("admin")).toBe(false);
    expect(isSettingsTab("")).toBe(false);
    expect(isSettingsTab(undefined)).toBe(false);
  });

  it("links the default tab without a query and the others with ?tab=", () => {
    expect(settingsHref()).toBe("/dashboard/settings");
    expect(settingsHref("profile")).toBe("/dashboard/settings");
    expect(settingsHref("appearance")).toBe("/dashboard/settings?tab=appearance");
    expect(settingsHref("password")).toBe("/dashboard/settings?tab=password");
    expect(settingsHref("security")).toBe("/dashboard/settings?tab=security");
  });

  it("keeps extra query after the tab and drops empty values and a competing tab", () => {
    expect(settingsHref("security", { setup: "1" })).toBe("/dashboard/settings?tab=security&setup=1");
    expect(settingsHref("security", { tab: "profile", empty: "", missing: undefined })).toBe(
      "/dashboard/settings?tab=security",
    );
    expect(settingsHref("profile", { a: ["1", "2"] })).toBe("/dashboard/settings?a=1&a=2");
  });
});

describe("legacy account routes", () => {
  it("maps every old page to its tab", () => {
    expect(LEGACY_SETTINGS_ROUTES).toEqual({
      "/dashboard/profile": "profile",
      "/dashboard/change-password": "password",
      "/dashboard/security": "security",
    });
    expect(legacySettingsRedirect("/dashboard/profile")).toBe("/dashboard/settings");
    expect(legacySettingsRedirect("/dashboard/change-password")).toBe("/dashboard/settings?tab=password");
    expect(legacySettingsRedirect("/dashboard/security")).toBe("/dashboard/settings?tab=security");
  });

  it("carries the query along, so the grace banner's setup link still opens the flow", () => {
    expect(legacySettingsRedirect("/dashboard/security", { setup: "1" })).toBe(
      "/dashboard/settings?tab=security&setup=1",
    );
    // A stale tab in the old link cannot override where the page now lives.
    expect(legacySettingsRedirect("/dashboard/change-password", { tab: "security" })).toBe(
      "/dashboard/settings?tab=password",
    );
  });

  it("tolerates a trailing slash and falls back to the default tab for anything unknown", () => {
    expect(legacySettingsRedirect("/dashboard/security/")).toBe("/dashboard/settings?tab=security");
    expect(legacySettingsRedirect("/dashboard/elsewhere")).toBe("/dashboard/settings");
  });
});
