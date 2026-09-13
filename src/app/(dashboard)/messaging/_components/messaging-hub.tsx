"use client";

import { PageHeader, Tabs } from "@/components/kit";
import { useTabParam } from "@/lib/admin/url-state";

import { ComposeTab } from "./compose-tab";
import { HistoryTab } from "./history-tab";
import { LogTab } from "./log-tab";

/**
 * Messaging: write a broadcast to a segment, read back what was sent, and
 * inspect every delivery the platform recorded. Tab lives in the URL.
 */
const TABS = ["compose", "history", "log"] as const;
type Tab = (typeof TABS)[number];

const DESCRIPTION: Record<Tab, string> = {
  compose: "One message to customers, couriers or businesses, over push and email. Everyone also gets an in-app copy.",
  history: "Every broadcast sent, with how far it got.",
  log: "Each notification the platform tried to deliver, and whether it landed.",
};

export function MessagingHub() {
  const [tab, setTab] = useTabParam<Tab>("compose", TABS);
  return (
    <div>
      <PageHeader title="Messaging" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "compose", label: "Compose" },
          { id: "history", label: "History" },
          { id: "log", label: "Log" },
        ]}
      />
      {tab === "compose" ? <ComposeTab /> : tab === "history" ? <HistoryTab /> : <LogTab />}
    </div>
  );
}
