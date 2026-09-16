"use client";

import { Suspense } from "react";

import { PageHeader, Tabs } from "@/components/kit";
import { useIssuesSummary } from "@/lib/admin/hooks";
import { useTabParam } from "@/lib/admin/url-state";

import { OverviewTab } from "./_components/overview-tab";
import { QueueTab } from "./_components/queue-tab";

/**
 * Support: the reports customers file from the app (Report Issue → My Reports). Agents work the
 * queue here; the overview tab tracks how well the queue is being served.
 */
const TABS = ["queue", "overview"] as const;
type Tab = (typeof TABS)[number];

function SupportHub() {
  const [tab, setTab] = useTabParam<Tab>("queue", TABS);
  const summary = useIssuesSummary();
  return (
    <div>
      <PageHeader
        title="Support"
        description={
          tab === "queue"
            ? "Every issue a customer has reported, newest and most urgent first."
            : "How the support queue is doing: backlog, response times and what people report most."
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "queue", label: "Queue", count: summary.data ? summary.data.open + summary.data.inReview : undefined },
          { id: "overview", label: "Overview" },
        ]}
      />
      {tab === "queue" ? <QueueTab /> : <OverviewTab />}
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense>
      <SupportHub />
    </Suspense>
  );
}
