"use client";

import { Suspense } from "react";

import { PageHeader, Tabs } from "@/components/kit";
import { useTabParam } from "@/lib/admin/url-state";

import { BadgesTab } from "./_components/badges-tab";
import { OverviewTab } from "./_components/overview-tab";
import { UnlocksTab } from "./_components/unlocks-tab";

/**
 * Achievements: the customer badge programme (Badges & Rewards in the app). See which badges
 * customers earn, what those rewards cost, and — from a customer's profile — grant or revoke one.
 */
const TABS = ["overview", "badges", "unlocks"] as const;
type Tab = (typeof TABS)[number];

const DESCRIPTION: Record<Tab, string> = {
  overview: "How many customers are earning badges, and what the rewards are costing.",
  badges: "The catalogue customers see in Badges & Rewards, with each badge's unlock and reward numbers.",
  unlocks: "Who unlocked what, when, and whether they used the reward.",
};

function AchievementsHub() {
  const [tab, setTab] = useTabParam<Tab>("overview", TABS);
  return (
    <div>
      <PageHeader title="Achievements" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "overview", label: "Overview" },
          { id: "badges", label: "Badges" },
          { id: "unlocks", label: "Unlocks" },
        ]}
      />
      {tab === "overview" ? <OverviewTab /> : tab === "badges" ? <BadgesTab /> : <UnlocksTab />}
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense>
      <AchievementsHub />
    </Suspense>
  );
}
