"use client";

import { Suspense } from "react";

import { DeveloperDrawer } from "@/components/developers/developer-drawer";
import { DeveloperMonitoringPanel } from "@/components/developers/developer-monitoring";
import { DevelopersTable, type DevelopersMode } from "@/components/developers/developers-table";
import { PageHeader, Tabs } from "@/components/kit";
import { useDeveloperQueueCount } from "@/lib/admin/hooks";
import { useOpenParam, useTabParam } from "@/lib/admin/url-state";

/**
 * Teams building on the Developer API: the live-access review queue (oldest first), every team,
 * and how the API is doing. A team opens in a drawer kept in the URL (?open=), so links from
 * the orders board and the alerts land on it.
 */
type Tab = DevelopersMode | "monitoring";
const TABS: readonly Tab[] = ["queue", "all", "monitoring"];

const DESCRIPTION: Record<Tab, string> = {
  queue: "Teams asking to go live. Check who they are and what they deliver, then approve or tell them what to fix.",
  all: "Every team building on the Developer API, with their usage, keys and members.",
  monitoring: "Errors, speed and webhooks across the Developer API, checked every minute.",
};

function DevelopersHub() {
  const [tab, setTab] = useTabParam<Tab>("queue", TABS);
  const queue = useDeveloperQueueCount();
  const [teamId, setTeamId] = useOpenParam();

  return (
    <div>
      <PageHeader title="Developers" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "queue", label: "Review queue", count: queue.data },
          { id: "all", label: "All teams" },
          { id: "monitoring", label: "Monitoring" },
        ]}
      />
      {tab === "monitoring" ? (
        <DeveloperMonitoringPanel onOpenTeam={setTeamId} />
      ) : (
        <DevelopersTable key={tab} mode={tab} onOpen={setTeamId} />
      )}
      <DeveloperDrawer teamId={teamId} onClose={() => setTeamId(null)} />
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <Suspense>
      <DevelopersHub />
    </Suspense>
  );
}
