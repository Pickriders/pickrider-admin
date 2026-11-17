"use client";

import { Suspense } from "react";

import { DeveloperIncidentsPanel } from "@/components/developers/developer-incidents";
import { DeveloperMonitoringPanel } from "@/components/developers/developer-monitoring";
import { DevelopersTable, type DevelopersMode } from "@/components/developers/developers-table";
import { PageHeader, Tabs } from "@/components/kit";
import { useDeveloperQueueCount } from "@/lib/admin/hooks";
import { useTabParam } from "@/lib/admin/url-state";

/**
 * Teams building on the Developer API: the live-access review queue (oldest first), every team,
 * and how the API is doing. Each team opens on its own page, /developers/<teamId>.
 */
type Tab = DevelopersMode | "monitoring" | "status";
const TABS: readonly Tab[] = ["queue", "all", "monitoring", "status"];

const DESCRIPTION: Record<Tab, string> = {
  queue: "Teams asking to go live. Check who they are and what they deliver, then approve or tell them what to fix.",
  all: "Every team building on the Developer API, with their usage, keys and members.",
  monitoring: "Errors, speed and webhooks across the Developer API, checked every minute.",
  status: "Incidents on the public status page: open one, keep developers posted, resolve it.",
};

function DevelopersHub() {
  const [tab, setTab] = useTabParam<Tab>("queue", TABS);
  const queue = useDeveloperQueueCount();

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
          { id: "status", label: "Status" },
        ]}
      />
      {tab === "monitoring" ? (
        <DeveloperMonitoringPanel />
      ) : tab === "status" ? (
        <DeveloperIncidentsPanel />
      ) : (
        <DevelopersTable key={tab} mode={tab} />
      )}
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
