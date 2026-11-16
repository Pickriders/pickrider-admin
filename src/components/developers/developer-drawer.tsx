"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CircleSlash,
  Globe,
  KeyRound,
  Mail,
  Phone,
  Users,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Badge, Button, Drawer, ErrorState, KeyValue, Skeleton, cx } from "@/components/kit";
import type { DeveloperDetail, DeveloperKey, DeveloperModeStats } from "@/lib/admin/api";
import { ago, count, day, naira, percent, when } from "@/lib/admin/format";
import { useDeveloper } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";

import { DeveloperActionDialog, RevokeKeyDialog } from "./developer-actions";
import {
  ACTIONS,
  KeyStatusBadge,
  LiveStatusBadge,
  ModeBadge,
  TeamAvatar,
  TeamSuspendedBadge,
  VOLUME_LABEL,
  availableActions,
  waited,
  type DeveloperActionId,
} from "./developer-ui";

function Section({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: typeof Users;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
          {Icon ? <Icon size={13} aria-hidden /> : null}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Verified({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cx("inline-flex items-center gap-1 text-[11px] font-semibold", ok ? "text-success" : "text-ink-faint")}
    >
      {ok ? <BadgeCheck size={12} aria-hidden /> : <CircleSlash size={12} aria-hidden />}
      {label} {ok ? "verified" : "not verified"}
    </span>
  );
}

/** Why the team is held back, said at the top so nobody misses it. */
function Notice({ team }: { team: DeveloperDetail }) {
  const notice =
    team.status === "SUSPENDED"
      ? {
          title: "Team suspended",
          body: team.suspensionReason,
          at: team.suspendedAt,
          extra: "Every key is refused with account_suspended.",
        }
      : team.liveStatus === "SUSPENDED"
        ? {
            title: "Live access suspended",
            body: team.liveSuspensionReason,
            at: team.liveReviewedAt,
            extra: "Test keys still work.",
          }
        : team.liveStatus === "REJECTED"
          ? {
              title: "Live access rejected",
              body: team.liveRejectionReason,
              at: team.liveReviewedAt,
              extra: "They can fix this and ask again.",
            }
          : null;
  if (!notice) return null;
  return (
    <div role="status" className="mb-5 flex gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden />
      <div className="min-w-0 text-sm">
        <p className="font-bold text-ink">
          {notice.title}
          {notice.at ? <span className="ml-2 text-xs font-medium text-ink-muted">{when(notice.at)}</span> : null}
        </p>
        {notice.body ? <p className="mt-0.5 text-ink">&ldquo;{notice.body}&rdquo;</p> : null}
        <p className="mt-0.5 text-xs text-ink-muted">
          {notice.extra}
          {team.liveReviewedBy && team.status !== "SUSPENDED" ? ` Decided by ${team.liveReviewedBy.name}.` : null}
        </p>
      </div>
    </div>
  );
}

/** What the developer told us when asking for live access: what a reviewer decides on. */
function Request({ team }: { team: DeveloperDetail }) {
  return (
    <Section
      title={team.liveStatus === "PENDING" ? `Live request, waiting ${waited(team.liveRequestedAt)}` : "Business"}
    >
      {team.useCase ? (
        <p className="mb-4 whitespace-pre-line rounded-xl bg-surface px-4 py-3 text-sm leading-6 text-ink">
          {team.useCase}
        </p>
      ) : null}
      <KeyValue
        items={[
          {
            label: "Website",
            value: team.website ? (
              <a
                href={team.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-brand-dark hover:underline"
              >
                <Globe size={12} aria-hidden />
                {team.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null,
          },
          {
            label: "Expected volume",
            value: team.expectedMonthlyVolume ? VOLUME_LABEL[team.expectedMonthlyVolume] : null,
          },
          { label: "Support email", value: team.supportEmail },
          { label: "Support phone", value: team.supportPhone },
          { label: "Requested", value: team.liveRequestedAt ? when(team.liveRequestedAt) : null },
          { label: "Signed up", value: day(team.createdAt) },
        ]}
      />
      {team.owner ? (
        <div className="mt-4 rounded-xl border border-line px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Owner</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">{team.owner.name}</p>
          <p className="flex flex-wrap items-center gap-x-3 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Mail size={11} aria-hidden /> {team.owner.email}
            </span>
            {team.owner.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone size={11} aria-hidden /> {team.owner.phone}
              </span>
            ) : null}
          </p>
          <p className="mt-1.5 flex flex-wrap gap-3">
            <Verified ok={team.owner.emailVerified} label="Email" />
            <Verified ok={team.owner.phoneVerified} label="Phone" />
          </p>
        </div>
      ) : null}
    </Section>
  );
}

function Figure({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "danger" | "warning";
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface px-3 py-2.5">
      <p className="truncate text-[11px] font-semibold text-ink-muted">{label}</p>
      <p
        className={cx(
          "mt-0.5 truncate text-lg font-bold tabular-nums tracking-tight",
          tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? <p className="truncate text-[11px] text-ink-faint">{hint}</p> : null}
    </div>
  );
}

/** One mode's money, orders, webhooks and traffic. */
function Usage({ teamId, stats, livemode }: { teamId: string; stats: DeveloperModeStats; livemode: boolean }) {
  const errorRate = stats.requests30d ? stats.errors30d / stats.requests30d : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Figure
          label="Wallet"
          value={stats.wallet ? naira(stats.wallet.available) : "No wallet"}
          hint={
            stats.wallet?.held ? `${naira(stats.wallet.held)} held for orders` : livemode ? undefined : "Test money"
          }
        />
        <Figure
          label="Orders, 30 days"
          value={count(stats.orders.last30Days)}
          hint={`${count(stats.orders.total)} all time`}
        />
        <Figure
          label="In progress"
          value={count(stats.orders.active)}
          hint={`${count(stats.orders.delivered)} delivered, ${count(stats.orders.cancelled)} cancelled`}
        />
        <Figure
          label="Requests, 30 days"
          value={count(stats.requests30d)}
          hint={stats.lastRequestAt ? `Last ${ago(stats.lastRequestAt)}` : "No requests yet"}
        />
        <Figure
          label="Error answers"
          value={stats.requests30d ? percent(errorRate * 100) : "None"}
          hint={`${count(stats.errors30d)} of their requests failed`}
          tone={errorRate > 0.2 ? "warning" : undefined}
        />
        <Figure
          label="Webhooks"
          value={`${count(stats.webhooks.healthy)} of ${count(stats.webhooks.endpoints)}`}
          hint={
            stats.webhooks.failing || stats.webhooks.disabled
              ? `${count(stats.webhooks.failing)} failing, ${count(stats.webhooks.disabled)} off`
              : "healthy"
          }
          tone={stats.webhooks.failing ? "danger" : stats.webhooks.disabled ? "warning" : undefined}
        />
      </div>
      <Link
        href={`/orders?tab=all&channel=DEVELOPER_API&teamId=${teamId}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:underline"
      >
        See this team&apos;s orders <ArrowUpRight size={12} aria-hidden />
      </Link>
    </div>
  );
}

function ModeSwitch({
  value,
  onChange,
  live,
}: {
  value: "test" | "live";
  onChange: (v: "test" | "live") => void;
  live: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Mode" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {(["test", "live"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={cx(
            "h-7 rounded-md px-3 text-xs font-semibold capitalize transition-colors",
            value === mode ? "bg-card text-ink shadow-sm" : "text-ink-muted hover:text-ink",
          )}
        >
          {mode}
          {mode === "live" && !live ? <span className="ml-1 text-ink-faint">(off)</span> : null}
        </button>
      ))}
    </div>
  );
}

function KeyRow({ apiKey, canRevoke, onRevoke }: { apiKey: DeveloperKey; canRevoke: boolean; onRevoke: () => void }) {
  const usable = apiKey.status === "active" || apiKey.status === "expiring";
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted">
        <KeyRound size={14} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{apiKey.label || "Unnamed key"}</span>
          <ModeBadge livemode={apiKey.livemode} />
          <KeyStatusBadge status={apiKey.status} />
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink-muted">{apiKey.prefix}…</p>
        <p className="mt-0.5 text-[11px] text-ink-faint">
          {apiKey.revokedAt
            ? `Revoked ${when(apiKey.revokedAt)}${apiKey.revokedReason ? `: “${apiKey.revokedReason}”` : ""}`
            : `${apiKey.lastUsedAt ? `Used ${ago(apiKey.lastUsedAt)}` : "Never used"}${apiKey.expiresAt ? ` · expires ${day(apiKey.expiresAt)}` : ""}${apiKey.scopes.length ? ` · ${apiKey.scopes.length} scopes` : " · full access"}`}
        </p>
      </div>
      {usable && canRevoke ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRevoke}
          className="shrink-0 text-danger hover:bg-danger-soft hover:text-danger"
        >
          Revoke
        </Button>
      ) : null}
    </li>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

/** A developer team, everything a reviewer or support needs, with the actions its state allows. */
export function DeveloperDrawer({ teamId, onClose }: { teamId: string | null; onClose: () => void }) {
  const detail = useDeveloper(teamId ?? "");
  const team = detail.data;
  const { can } = useCan();
  const manage = can("developer.manage");
  const [action, setAction] = useState<DeveloperActionId | null>(null);
  const [revoking, setRevoking] = useState<DeveloperKey | null>(null);
  const [mode, setMode] = useState<"test" | "live">("test");
  const [showRevoked, setShowRevoked] = useState(false);

  const actions = team ? availableActions(team) : [];
  const main = actions.filter((id) => id !== "suspendTeam");
  const keys = (team?.keys ?? []).filter((k) => showRevoked || k.status === "active" || k.status === "expiring");
  const hiddenKeys = (team?.keys.length ?? 0) - keys.length;

  return (
    <>
      <Drawer
        open={Boolean(teamId)}
        onClose={onClose}
        width="lg"
        title={
          team ? (
            <span className="flex min-w-0 items-center gap-3">
              <TeamAvatar name={team.name} size={40} />
              <span className="min-w-0">
                <span className="block truncate">{team.name}</span>
                <span className="block truncate text-xs font-medium text-ink-muted">
                  @{team.handle}
                  {team.companyName && team.companyName !== team.name ? ` · ${team.companyName}` : ""}
                </span>
              </span>
            </span>
          ) : (
            "Developer team"
          )
        }
        subtitle={
          team ? (
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              <LiveStatusBadge status={team.liveStatus} />
              <TeamSuspendedBadge team={team} />
              <Badge tone="neutral">
                <Users size={11} aria-hidden /> {count(team.memberCount)}
              </Badge>
            </span>
          ) : undefined
        }
        footer={
          team && manage && actions.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {main.map((id) => (
                <Button
                  key={id}
                  variant={
                    id === "approve" || id === "restoreTeam" || id === "unsuspendLive"
                      ? "primary"
                      : id === "reject"
                        ? "outline"
                        : "danger"
                  }
                  onClick={() => setAction(id)}
                >
                  {ACTIONS[id].label}
                </Button>
              ))}
              {actions.includes("suspendTeam") ? (
                <Button
                  variant="ghost"
                  onClick={() => setAction("suspendTeam")}
                  className="ml-auto text-danger hover:bg-danger-soft hover:text-danger"
                >
                  {ACTIONS.suspendTeam.label}
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      >
        {detail.isLoading ? (
          <DrawerSkeleton />
        ) : detail.isError ? (
          <ErrorState message={errorMessage(detail.error)} onRetry={() => void detail.refetch()} />
        ) : team ? (
          <div>
            <Notice team={team} />
            <Request team={team} />

            <Section
              title="Usage"
              action={<ModeSwitch value={mode} onChange={setMode} live={team.liveStatus === "APPROVED"} />}
            >
              <Usage teamId={team.id} stats={mode === "live" ? team.live : team.test} livemode={mode === "live"} />
            </Section>

            <Section
              title={`API keys (${count(team.keys.filter((k) => k.status === "active" || k.status === "expiring").length)} working)`}
              icon={KeyRound}
              action={
                hiddenKeys || showRevoked ? (
                  <button
                    type="button"
                    onClick={() => setShowRevoked((v) => !v)}
                    className="text-xs font-semibold text-ink-muted hover:text-ink"
                  >
                    {showRevoked ? "Hide old keys" : `Show ${count(hiddenKeys)} revoked or expired`}
                  </button>
                ) : undefined
              }
            >
              {keys.length ? (
                <ul className="divide-y divide-line">
                  {keys.map((k) => (
                    <KeyRow key={k.id} apiKey={k} canRevoke={manage} onRevoke={() => setRevoking(k)} />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-muted">No working keys. They create keys in the developer dashboard.</p>
              )}
            </Section>

            <Section title="Members" icon={Users}>
              <ul className="divide-y divide-line">
                {team.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {m.name}
                        {m.isOwner ? (
                          <span className="ml-2 text-[11px] font-semibold text-brand-dark">Owner</span>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">{m.email}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium capitalize text-ink-muted">
                      {m.role.replace(/^TEAM_/, "").toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            <p className="flex items-center gap-1.5 border-t border-line pt-4 text-[11px] text-ink-faint">
              <Webhook size={11} aria-hidden /> Team id <span className="font-mono">{team.id}</span>
            </p>
          </div>
        ) : null}
      </Drawer>
      {team ? <DeveloperActionDialog action={action} team={team} onClose={() => setAction(null)} /> : null}
      {team ? <RevokeKeyDialog teamId={team.id} apiKey={revoking} onClose={() => setRevoking(null)} /> : null}
    </>
  );
}
