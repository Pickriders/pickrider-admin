"use client";

import { PageHeader, Tabs } from "@/components/kit";
import { useTabParam } from "@/lib/admin/url-state";

import { AuditTab } from "./audit-tab";
import { DataLogTab } from "./data-log-tab";
import { SettingsTab } from "./settings-tab";
import { TeamTab } from "./team-tab";

/**
 * Admin hub: staff and teams, platform settings, and the two logs, on one
 * page with the tab in the URL so old deep links keep working via redirects.
 */
const TABS = ["team", "settings", "audit", "logs"] as const;
type Tab = (typeof TABS)[number];

const DESCRIPTION: Record<Tab, string> = {
  team: "Platform staff, business and developer teams.",
  settings: "Countries, states, pricing, dispatch and referral knobs.",
  audit: "Every admin and system request, with what was sent and what came back.",
  logs: "Structured system logs and errors the API recorded.",
};

export function AdminHub() {
  const [tab, setTab] = useTabParam<Tab>("team", TABS);
  return (
    <div>
      <PageHeader title="Admin" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "team", label: "Team" },
          { id: "settings", label: "App settings" },
          { id: "audit", label: "Audit log" },
          { id: "logs", label: "Data logs" },
        ]}
      />
      {tab === "team" ? <TeamTab /> : tab === "settings" ? <SettingsTab /> : tab === "audit" ? <AuditTab /> : <DataLogTab />}
    </div>
  );
}
