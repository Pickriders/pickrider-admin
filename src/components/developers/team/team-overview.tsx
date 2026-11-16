"use client";

import { Activity, ArrowRight, CheckCircle2, Circle, Clock, Package, Wallet, Webhook, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState, Panel, Skeleton, StatCard, StatGrid, cx } from "@/components/kit";
import type { DeveloperDetail } from "@/lib/admin/api";
import { ago, count, naira, percent, when } from "@/lib/admin/format";
import { useDeveloperActivity, useDeveloperUsage } from "@/lib/admin/hooks";

import { VOLUME_LABEL } from "../developer-ui";
import { ActivityItem } from "./team-activity";
import { CardTitle, Fact, type Mode } from "./team-shared";
import { OrdersPerDay } from "./team-usage";

type Step = { label: string; at?: string | null; detail?: ReactNode; state: "done" | "current" | "failed" | "todo" };

/** Signed up, asked, decided: where the team is on the road to live, and who decided. */
export function liveJourney(team: DeveloperDetail): Step[] {
  const requested = Boolean(team.liveRequestedAt);
  const decided = team.liveStatus === "APPROVED" || team.liveStatus === "REJECTED" || team.liveStatus === "SUSPENDED";
  const by = team.liveReviewedBy ? ` by ${team.liveReviewedBy.name}` : "";
  const steps: Step[] = [
    { label: "Signed up", at: team.createdAt, state: "done" },
    { label: requested ? "Asked to go live" : "Hasn't asked to go live", at: team.liveRequestedAt, state: requested ? "done" : "todo" },
  ];
  if (team.liveStatus === "PENDING") steps.push({ label: "Waiting for a decision", state: "current" });
  else if (decided)
    steps.push({
      label: team.liveStatus === "REJECTED" ? `Rejected${by}` : `Approved${by}`,
      at: team.liveReviewedAt,
      detail: team.liveStatus === "REJECTED" ? team.liveRejectionReason : null,
      state: team.liveStatus === "REJECTED" ? "failed" : "done",
    });
  if (team.liveStatus === "SUSPENDED") steps.push({ label: "Live access suspended", detail: team.liveSuspensionReason, state: "failed" });
  if (team.status === "SUSPENDED") steps.push({ label: `Team suspended${team.suspendedBy ? ` by ${team.suspendedBy.name}` : ""}`, at: team.suspendedAt, detail: team.suspensionReason, state: "failed" });
  return steps;
}

const STEP_ICON = {
  done: <CheckCircle2 size={16} className="text-success" aria-hidden />,
  current: <Clock size={16} className="text-warning" aria-hidden />,
  failed: <XCircle size={16} className="text-danger" aria-hidden />,
  todo: <Circle size={16} className="text-line-strong" aria-hidden />,
};

function Journey({ team }: { team: DeveloperDetail }) {
  return (
    <ol className="space-y-3.5 px-5 pb-5 pt-4">
      {liveJourney(team).map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 shrink-0">{STEP_ICON[step.state]}</span>
          <div className="min-w-0">
            <p className={cx("text-sm font-semibold", step.state === "todo" ? "text-ink-muted" : "text-ink")}>{step.label}</p>
            {step.at ? <p className="text-xs text-ink-faint">{when(step.at)}</p> : null}
            {step.detail ? <p className="mt-1 rounded-lg bg-surface px-2.5 py-1.5 text-xs text-ink">&ldquo;{step.detail}&rdquo;</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function RecentActivity({ teamId, onSeeAll }: { teamId: string; onSeeAll: () => void }) {
  const activity = useDeveloperActivity(teamId, {});
  const rows = activity.rows.slice(0, 5);
  return (
    <Panel className="flex flex-col">
      <CardTitle
        title="Recent activity"
        icon={Activity}
        action={
          <button type="button" onClick={onSeeAll} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:underline">
            See all <ArrowRight size={12} aria-hidden />
          </button>
        }
      />
      <div className="flex-1 px-5 pb-5 pt-4">
        {activity.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : rows.length ? (
          <ol>
            {rows.map((row) => (
              <ActivityItem key={row.id} row={row} compact />
            ))}
          </ol>
        ) : (
          <EmptyState compact icon={Activity} title="Nothing yet" />
        )}
      </div>
    </Panel>
  );
}

/** The team at a glance in the page's mode: money, orders, traffic, webhooks, the road to live, and what changed lately. */
export function TeamOverview({ team, mode, onTab }: { team: DeveloperDetail; mode: Mode; onTab: (tab: "activity" | "webhooks" | "requests" | "wallet") => void }) {
  const stats = mode === "live" ? team.live : team.test;
  const usage = useDeveloperUsage(team.id, mode === "live", "30d");
  const errorRate = stats.requests30d ? (stats.errors30d / stats.requests30d) * 100 : null;
  const spark = usage.data?.orders.per_day.map((d) => ({ value: d.created }));

  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard
          label={`${mode === "live" ? "Live" : "Test"} wallet`}
          value={stats.wallet ? naira(stats.wallet.available) : "No wallet"}
          icon={Wallet}
          tone={mode === "live" && stats.wallet ? "brand" : "default"}
          hint={stats.wallet ? (stats.wallet.held ? `${naira(stats.wallet.held)} held for orders in progress` : "Nothing held") : mode === "live" ? "Opened when live access is approved" : undefined}
          onClick={() => onTab("wallet")}
        />
        <StatCard
          label="Orders, 30 days"
          value={count(stats.orders.last30Days)}
          icon={Package}
          spark={spark}
          hint={`${count(stats.orders.active)} in progress · ${count(stats.orders.total)} all time`}
        />
        <StatCard
          label="API requests, 30 days"
          value={count(stats.requests30d)}
          icon={Activity}
          hint={stats.requests30d ? `${percent(errorRate)} answered with an error · last ${ago(stats.lastRequestAt)}` : "No requests yet"}
          onClick={() => onTab("requests")}
        />
        <StatCard
          label="Webhook endpoints"
          value={stats.webhooks.endpoints ? `${count(stats.webhooks.healthy)} of ${count(stats.webhooks.endpoints)} healthy` : "None"}
          icon={Webhook}
          hint={stats.webhooks.failing || stats.webhooks.disabled ? `${count(stats.webhooks.failing)} failing · ${count(stats.webhooks.disabled)} turned off` : stats.webhooks.endpoints ? "All delivering" : "They haven't added one"}
          onClick={() => onTab("webhooks")}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OrdersPerDay usage={usage.data} loading={usage.isLoading} title="Orders, last 30 days" height={300} />
        </div>
        <RecentActivity teamId={team.id} onSeeAll={() => onTab("activity")} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <CardTitle title="Business" hint="What the team told us about itself." />
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 pb-5 pt-4 sm:grid-cols-2">
            <Fact label="Company">{team.companyName}</Fact>
            <Fact label="Expected volume">{team.expectedMonthlyVolume ? VOLUME_LABEL[team.expectedMonthlyVolume] : null}</Fact>
            <Fact label="Support email">{team.supportEmail}</Fact>
            <Fact label="Support phone">{team.supportPhone}</Fact>
            <div className="sm:col-span-2">
              <Fact label="What they deliver">{team.useCase ? <span className="whitespace-pre-line font-normal leading-6">{team.useCase}</span> : null}</Fact>
            </div>
          </dl>
        </Panel>
        <Panel>
          <CardTitle title="Road to live" />
          <Journey team={team} />
        </Panel>
      </div>
    </div>
  );
}
