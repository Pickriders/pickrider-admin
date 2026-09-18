"use client";

import { Suspense } from "react";

import { PageHeader, Tabs } from "@/components/kit";
import { canManageCoupons, getAdminRoles } from "@/lib/admin-access";
import { useTabParam } from "@/lib/admin/url-state";

import { CouponsTab } from "./_components/coupons-tab";
import { GroupsTab } from "./_components/groups-tab";
import { OverviewTab } from "./_components/overview-tab";

/**
 * Coupons: every discount code on the platform, who it is for, how often it is used and what it
 * costs. Badge rewards (auto-issued coupons) show up here too, filtered out of the promo list by
 * default. Finance and operations can look; platform admins can change things.
 */
const TABS = ["overview", "coupons", "groups"] as const;
type Tab = (typeof TABS)[number];

const DESCRIPTION: Record<Tab, string> = {
  overview: "How the coupon programme is doing: what's live, what it's costing, and what customers actually redeem.",
  coupons: "Every coupon, with redemptions and discount given. Open one to see who used it.",
  groups: "Customer groups that targeted coupons are attached to.",
};

function CouponsHub() {
  const [tab, setTab] = useTabParam<Tab>("overview", TABS);
  const canManage = canManageCoupons(getAdminRoles());
  return (
    <div>
      <PageHeader title="Coupons" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "overview", label: "Overview" },
          { id: "coupons", label: "Coupons" },
          { id: "groups", label: "Groups" },
        ]}
      />
      {tab === "overview" ? (
        <OverviewTab />
      ) : tab === "coupons" ? (
        <CouponsTab canManage={canManage} />
      ) : (
        <GroupsTab canManage={canManage} />
      )}
    </div>
  );
}

export default function CouponsPage() {
  return (
    <Suspense>
      <CouponsHub />
    </Suspense>
  );
}
