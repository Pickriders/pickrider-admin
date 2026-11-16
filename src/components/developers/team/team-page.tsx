"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ErrorState, PageHeader, Tabs } from "@/components/kit";
import { OrdersTable } from "@/components/users/user-panels";
import type { DeveloperDetail } from "@/lib/admin/api";
import { useDeveloper } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useQueryParam, useTabParam } from "@/lib/admin/url-state";

import { TeamKeys, TeamMembers } from "./team-access";
import { TeamActivity } from "./team-activity";
import { TeamHeader, TeamHeaderSkeleton } from "./team-header";
import { TeamOverview } from "./team-overview";
import { TeamRequests } from "./team-requests";
import { ModeSwitch, type Mode } from "./team-shared";
import { TeamUsage } from "./team-usage";
import { TeamWallet } from "./team-wallet";
import { TeamWebhooks } from "./team-webhooks";

const TABS = ["overview", "usage", "orders", "requests", "webhooks", "wallet", "keys", "members", "activity"] as const;
type Tab = (typeof TABS)[number];
/** Tabs whose numbers depend on test or live; the others show both modes or neither. */
const MODED: readonly Tab[] = ["overview", "usage", "orders", "requests", "webhooks", "wallet", "keys"];

/** Live once the team has been live; test before, which is where a reviewer looks. */
export function defaultMode(team: Pick<DeveloperDetail, "liveStatus">): Mode {
  return team.liveStatus === "APPROVED" || team.liveStatus === "SUSPENDED" ? "live" : "test";
}

function Back() {
  return (
    <Link href="/developers?tab=all" className="inline-flex w-fit items-center gap-1.5 rounded-lg py-1 text-xs font-semibold text-ink-muted transition-colors hover:text-ink">
      <ArrowLeft size={14} aria-hidden /> Developers
    </Link>
  );
}

/**
 * One developer team, everything about it: who they are and where they stand with live access, then
 * overview, usage, orders, API requests, webhooks, wallet, keys, members and the full activity trail.
 * The test/live switch (?mode=) applies to every tab that has a mode; staff actions sit in the header.
 */
export function DeveloperTeamPage({ teamId }: { teamId: string }) {
  const detail = useDeveloper(teamId);
  const team = detail.data;
  const [tab, setTab] = useTabParam<Tab>("overview", TABS);
  const [modeParam, setModeParam] = useQueryParam("mode");
  const mode: Mode = modeParam === "live" || modeParam === "test" ? modeParam : team ? defaultMode(team) : "test";
  const ordersScope = useMemo(() => ({ channel: "DEVELOPER_API", teamId, livemode: mode === "live" ? "true" : "false" }), [teamId, mode]);

  if (detail.isError && !team) {
    return (
      <div className="space-y-4">
        <Back />
        <PageHeader title="Developer team" />
        <ErrorState message={errorMessage(detail.error, "Could not load this team.")} onRetry={() => void detail.refetch()} />
      </div>
    );
  }

  const working = team?.keys.filter((k) => k.status === "active" || k.status === "expiring").length;

  return (
    <div className="space-y-5">
      <Back />
      {team ? <TeamHeader team={team} /> : <TeamHeaderSkeleton />}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          className="min-w-0"
          items={[
            { id: "overview", label: "Overview" },
            { id: "usage", label: "Usage" },
            { id: "orders", label: "Orders" },
            { id: "requests", label: "API requests" },
            { id: "webhooks", label: "Webhooks" },
            { id: "wallet", label: "Wallet" },
            { id: "keys", label: "Keys & access", count: working },
            { id: "members", label: "Members", count: team?.memberCount },
            { id: "activity", label: "Activity" },
          ]}
        />
        {team && MODED.includes(tab) ? (
          <div className="shrink-0">
            <ModeSwitch value={mode} onChange={(next) => setModeParam(next === defaultMode(team) ? null : next)} liveOn={team.liveStatus === "APPROVED"} />
          </div>
        ) : null}
      </div>

      {!team ? null : tab === "overview" ? (
        <TeamOverview team={team} mode={mode} onTab={setTab} />
      ) : tab === "usage" ? (
        <TeamUsage teamId={team.id} mode={mode} />
      ) : tab === "orders" ? (
        <OrdersTable scope={ordersScope} csvName={`developer-${team.handle}-orders`} emptyDescription={`Orders this team creates with its ${mode} keys show up here.`} />
      ) : tab === "requests" ? (
        <TeamRequests team={team} mode={mode} />
      ) : tab === "webhooks" ? (
        <TeamWebhooks teamId={team.id} mode={mode} />
      ) : tab === "wallet" ? (
        <TeamWallet team={team} mode={mode} />
      ) : tab === "keys" ? (
        <TeamKeys team={team} mode={mode} />
      ) : tab === "members" ? (
        <TeamMembers team={team} />
      ) : (
        <TeamActivity teamId={team.id} />
      )}
    </div>
  );
}
