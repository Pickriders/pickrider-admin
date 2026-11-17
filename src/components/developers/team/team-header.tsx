"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CalendarDays,
  CircleSlash,
  Globe,
  Hash,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { ActionMenu, Badge, Button, Panel, Skeleton, cx } from "@/components/kit";
import { CopyButton } from "@/components/users/person-card";
import type { DeveloperDetail } from "@/lib/admin/api";
import { count, day, when } from "@/lib/admin/format";
import { useCan } from "@/lib/admin/use-can";

import { DeveloperActionDialog } from "../developer-actions";
import {
  ACTIONS,
  LiveStatusBadge,
  TeamSuspendedBadge,
  VOLUME_LABEL,
  availableActions,
  waited,
  type DeveloperActionId,
} from "../developer-ui";

function Logo({ team, size }: { team: DeveloperDetail; size: number }) {
  const letters = team.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  if (team.settings.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.settings.logo}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-2xl border border-line bg-card object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      className="grid shrink-0 place-items-center rounded-2xl bg-ink font-black tracking-tight text-card"
    >
      {letters}
    </span>
  );
}

function HeaderFact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink-muted"
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">{label}</dt>
        <dd className="flex min-w-0 items-center gap-1 text-sm font-semibold text-ink">{children}</dd>
      </div>
    </div>
  );
}

export function Verified({ ok, label }: { ok: boolean; label: string }) {
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
export function teamNotice(
  team: DeveloperDetail,
): { title: string; body: string | null; at: string | null; by: string | null; extra: string } | null {
  if (team.status === "SUSPENDED")
    return {
      title: "Team suspended",
      body: team.suspensionReason,
      at: team.suspendedAt,
      by: team.suspendedBy?.name ?? null,
      extra: "Every key, test and live, is refused with account_suspended.",
    };
  if (team.liveStatus === "SUSPENDED")
    return {
      title: "Live access suspended",
      body: team.liveSuspensionReason,
      at: team.liveReviewedAt,
      by: team.liveReviewedBy?.name ?? null,
      extra: "Live keys are refused. Test keys still work.",
    };
  if (team.liveStatus === "REJECTED")
    return {
      title: "Live request rejected",
      body: team.liveRejectionReason,
      at: team.liveReviewedAt,
      by: team.liveReviewedBy?.name ?? null,
      extra: "They can fix this and ask again.",
    };
  return null;
}

function Notice({ team }: { team: DeveloperDetail }) {
  const notice = teamNotice(team);
  if (!notice) return null;
  return (
    <div
      role="status"
      className="mx-4 mb-4 flex gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 sm:mx-5"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden />
      <div className="min-w-0 text-sm">
        <p className="font-bold text-ink">
          {notice.title}
          <span className="ml-2 text-xs font-medium text-ink-muted">
            {notice.at ? when(notice.at) : null}
            {notice.by ? ` by ${notice.by}` : null}
          </span>
        </p>
        {notice.body ? <p className="mt-0.5 text-ink">&ldquo;{notice.body}&rdquo;</p> : null}
        <p className="mt-0.5 text-xs text-ink-muted">{notice.extra}</p>
      </div>
    </div>
  );
}

/** What the developer told us when asking for live access, with the checks a reviewer makes. */
function ReviewCard({ team }: { team: DeveloperDetail }) {
  const owner = team.owner;
  const checks = [
    { ok: Boolean(owner?.emailVerified), label: "Owner's email verified" },
    { ok: Boolean(owner?.phoneVerified), label: "Owner's phone verified" },
    { ok: Boolean(team.website), label: "Website given" },
    { ok: Boolean(team.useCase && team.useCase.trim().length >= 20), label: "Use case described" },
    { ok: team.test.requests30d > 0, label: "Tried the API in test mode" },
  ];
  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-warning/40 bg-warning-soft/40 sm:mx-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warning/30 px-4 py-2.5">
        <p className="text-sm font-bold text-ink">Asking to go live, waiting {waited(team.liveRequestedAt)}</p>
        <p className="text-xs text-ink-muted">Requested {when(team.liveRequestedAt)}</p>
      </div>
      <div className="grid gap-4 px-4 py-3.5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">What they deliver</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink">
            {team.useCase || <span className="text-ink-faint">They didn&apos;t say.</span>}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Expects{" "}
            {team.expectedMonthlyVolume ? VOLUME_LABEL[team.expectedMonthlyVolume].toLowerCase() : "an unknown volume"}
            {" · "}
            {count(team.test.requests30d)} test requests and {count(team.test.orders.total)} test orders so far
          </p>
        </div>
        <ul className="space-y-1.5">
          {checks.map((check) => (
            <li
              key={check.label}
              className={cx("flex items-center gap-2 text-sm", check.ok ? "text-ink" : "text-ink-muted")}
            >
              {check.ok ? (
                <BadgeCheck size={15} className="shrink-0 text-success" aria-hidden />
              ) : (
                <CircleSlash size={15} className="shrink-0 text-ink-faint" aria-hidden />
              )}
              {check.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Actions({ team }: { team: DeveloperDetail }) {
  const { can } = useCan();
  const [action, setAction] = useState<DeveloperActionId | null>(null);
  if (!can("developer.manage")) return null;
  const actions = availableActions(team);
  const main = actions.filter((id) => id !== "suspendTeam");
  return (
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
        <ActionMenu
          iconOnly
          title="More actions"
          sections={[
            {
              id: "danger",
              items: [
                {
                  id: "suspendTeam",
                  label: ACTIONS.suspendTeam.label,
                  icon: Ban,
                  tone: "danger",
                  hint: "Stops every key, test and live",
                  onSelect: () => setAction("suspendTeam"),
                },
              ],
            },
          ]}
        />
      ) : null}
      <DeveloperActionDialog action={action} team={team} onClose={() => setAction(null)} />
    </div>
  );
}

export function TeamHeaderSkeleton() {
  return (
    <Panel className="overflow-hidden" aria-busy>
      <div className="flex items-start gap-4 p-5">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-2.5 pt-1">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 border-t border-line bg-surface/50 px-5 py-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    </Panel>
  );
}

/** Who the team is, where it stands, and the staff actions its state allows. */
export function TeamHeader({ team }: { team: DeveloperDetail }) {
  const owner = team.owner;
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <Logo team={team} size={64} />
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-ink [overflow-wrap:anywhere] sm:text-2xl">
              {team.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              <span className="font-mono">@{team.handle}</span>
              {team.companyName && team.companyName !== team.name ? ` · ${team.companyName}` : ""}
              {team.settings.description ? (
                <span className="block truncate text-ink-faint">{team.settings.description}</span>
              ) : null}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <LiveStatusBadge status={team.liveStatus} />
              <TeamSuspendedBadge team={team} />
              <Badge tone="neutral">
                <Users size={11} aria-hidden /> {count(team.memberCount)} member{team.memberCount === 1 ? "" : "s"}
              </Badge>
              {team.liveReviewedBy && team.liveStatus === "APPROVED" ? (
                <Badge tone="neutral">
                  <ShieldCheck size={11} aria-hidden /> Approved by {team.liveReviewedBy.name}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <Actions team={team} />
      </div>

      <Notice team={team} />
      {team.liveStatus === "PENDING" && team.status !== "SUSPENDED" ? <ReviewCard team={team} /> : null}

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line bg-surface/50 px-4 py-3.5 sm:grid-cols-2 sm:px-5 xl:grid-cols-4">
        <HeaderFact icon={Mail} label={owner ? `Owner · ${owner.name}` : "Owner"}>
          {owner ? (
            <>
              <a href={`mailto:${owner.email}`} className="min-w-0 truncate hover:underline">
                {owner.email}
              </a>
              <CopyButton text={owner.email} label="Copy email" />
            </>
          ) : (
            <span className="text-ink-faint">No owner</span>
          )}
        </HeaderFact>
        <HeaderFact icon={Phone} label="Support">
          <span className="min-w-0 truncate">
            {team.supportPhone || team.supportEmail || owner?.phone || (
              <span className="text-ink-faint">Not given</span>
            )}
          </span>
        </HeaderFact>
        <HeaderFact icon={Globe} label="Website">
          {team.website ? (
            <a
              href={team.website}
              target="_blank"
              rel="noreferrer noopener"
              className="min-w-0 truncate text-brand-dark hover:underline"
            >
              {team.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <span className="text-ink-faint">Not given</span>
          )}
        </HeaderFact>
        <HeaderFact icon={Hash} label="Team id">
          <span className="min-w-0 truncate font-mono text-[13px]">{team.id}</span>
          <CopyButton text={team.id} label="Copy team id" />
        </HeaderFact>
      </dl>
      {owner ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-xs text-ink-muted sm:px-5">
          <Verified ok={owner.emailVerified} label="Owner email" />
          <Verified ok={owner.phoneVerified} label="Owner phone" />
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} aria-hidden /> Signed up {day(team.createdAt)}
          </span>
          {team.updatedAt ? <span>Profile updated {day(team.updatedAt)}</span> : null}
        </div>
      ) : null}
    </Panel>
  );
}
