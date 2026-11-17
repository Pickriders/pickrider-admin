"use client";

import {
  Activity,
  Ban,
  KeyRound,
  Rocket,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, EmptyState, ErrorState, Panel, Skeleton, cx, type Tone } from "@/components/kit";
import type { DeveloperActivity } from "@/lib/admin/api";
import { day, time } from "@/lib/admin/format";
import { useDeveloperActivity } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { Expandable, JsonBlock, LoadMore, Segmented } from "./team-shared";

/** What each trail event says, as "<who> <does what>". `{t}` is the target's name. */
const PHRASE: Record<string, string> = {
  "team.created": "created the team",
  "team.ownership_transferred": "made {t} the owner",
  "team.suspended": "suspended the team",
  "team.restored": "restored the team",
  "invitation.created": "invited {t}",
  "invitation.resent": "resent the invitation to {t}",
  "invitation.revoked": "withdrew the invitation to {t}",
  "invitation.accepted": "joined the team",
  "invitation.declined": "declined the invitation for {t}",
  "member.role_changed": "changed the role of {t}",
  "member.removed": "removed {t}",
  "member.left": "left the team",
  "settings.updated": "updated the team settings",
  "live.requested": "asked for live access",
  "live.approved": "approved live access",
  "live.rejected": "rejected the live request",
  "live.suspended": "suspended live access",
  "live.restored": "restored live access",
  "key.created": "created the key {t}",
  "key.rolled": "rolled the key {t}",
  "key.revoked": "revoked the key {t}",
  "webhook.created": "added the endpoint {t}",
  "webhook.updated": "changed the endpoint {t}",
  "webhook.deleted": "deleted the endpoint {t}",
  "webhook.secret_rolled": "rolled the signing secret of {t}",
  "webhook.auto_disabled": "turned off {t} after 3 days of failed deliveries",
};

const AREA: Record<string, { icon: LucideIcon; tone: Tone }> = {
  team: { icon: Ban, tone: "danger" },
  live: { icon: Rocket, tone: "success" },
  key: { icon: KeyRound, tone: "warning" },
  webhook: { icon: Webhook, tone: "info" },
  member: { icon: Users, tone: "neutral" },
  invitation: { icon: UserPlus, tone: "neutral" },
  settings: { icon: Settings2, tone: "neutral" },
};

const ICON_TINT: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface text-ink-muted",
  brand: "bg-brand-soft text-brand-dark",
};

/** Who did it: the member, the staff member for a staff action, or Pickriders for the system. */
export function activityActor(row: Pick<DeveloperActivity, "actor" | "staff">): { name: string; staff: boolean } {
  if (row.actor) return { name: row.actor.name || row.actor.email || "A member", staff: false };
  if (row.staff) return { name: row.staff.name || "Pickriders staff", staff: true };
  return { name: "Pickriders", staff: false };
}

/** "revoked the key Server": the trail event in words, with the target's name filled in. */
export function activitySentence(row: Pick<DeveloperActivity, "event" | "target">): string {
  const target = row.target?.label || row.target?.type || "";
  const phrase = PHRASE[row.event] ?? row.event.replace(/[._]/g, " ");
  return phrase.replace("{t}", target).replace(/\s+/g, " ").trim();
}

/** The reason a staff action carried, if any: what the developer was told. */
function reasonOf(row: DeveloperActivity): string | null {
  const reason = (row.after as Record<string, unknown> | null)?.reason;
  return typeof reason === "string" && reason ? reason : null;
}

export function ActivityItem({ row, compact }: { row: DeveloperActivity; compact?: boolean }) {
  const area = AREA[row.event.split(".")[0]] ?? { icon: Activity, tone: "neutral" as Tone };
  const actor = activityActor(row);
  const reason = reasonOf(row);
  const changed = row.before || row.after;
  return (
    <li className="group/item relative flex gap-3.5 pb-5 last:pb-0">
      <span aria-hidden className="absolute bottom-0 left-[15px] top-9 w-px bg-line group-last/item:hidden" />
      <span
        className={cx(
          "relative grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-card",
          ICON_TINT[area.tone],
        )}
      >
        <area.icon size={14} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm leading-snug text-ink">
          <span className="font-semibold">{actor.name}</span>
          {actor.staff ? (
            <Badge tone="brand" className="mx-1.5 align-middle">
              <ShieldCheck size={10} aria-hidden /> Staff
            </Badge>
          ) : (
            " "
          )}
          {activitySentence(row)}
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {time(row.createdAt)}
          {row.actor?.email && !compact ? ` · ${row.actor.email}` : ""}
          <span className="ml-1.5 font-mono">{row.event}</span>
        </p>
        {reason ? (
          <p className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-xs text-ink">&ldquo;{reason}&rdquo;</p>
        ) : null}
        {changed && !compact ? (
          <div className="mt-1.5">
            <Expandable summary="What changed">
              <div className="grid gap-3 md:grid-cols-2">
                <JsonBlock label="Before" value={row.before} empty="Nothing before." />
                <JsonBlock label="After" value={row.after} empty="Nothing after." />
              </div>
            </Expandable>
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** Rows grouped under their day, newest first. */
export function groupByDay<T extends { createdAt: string }>(rows: T[]): { day: string; rows: T[] }[] {
  const groups: { day: string; rows: T[] }[] = [];
  for (const row of rows) {
    const label = day(row.createdAt);
    const last = groups[groups.length - 1];
    if (last?.day === label) last.rows.push(row);
    else groups.push({ day: label, rows: [row] });
  }
  return groups;
}

const FILTERS = [
  { value: "", label: "Everything" },
  { value: "live.", label: "Live access" },
  { value: "team.", label: "Suspensions" },
  { value: "key.", label: "Keys" },
  { value: "webhook.", label: "Webhooks" },
  { value: "member.", label: "Members" },
  { value: "invitation.", label: "Invitations" },
  { value: "settings.", label: "Settings" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

/** The team's whole audit trail: what members did, and what Pickriders staff did, by name. */
export function TeamActivity({ teamId }: { teamId: string }) {
  const [filter, setFilter] = useState<Filter>("");
  const query = useMemo(() => (filter ? { event: filter } : {}), [filter]);
  const activity = useDeveloperActivity(teamId, query);
  const groups = groupByDay(activity.rows);

  return (
    <Panel>
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Activity</h3>
          <p className="text-xs text-ink-muted">
            Everything the team and Pickriders staff changed. The developer sees staff actions as
            &ldquo;Pickriders&rdquo;.
          </p>
        </div>
        <Segmented
          label="Show"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ value: f.value, label: f.label }))}
        />
      </div>
      <div className="px-5 py-5">
        {activity.isLoading ? (
          <div className="space-y-5" aria-busy>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex gap-3.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.isError ? (
          <ErrorState
            message={errorMessage(activity.error, "Could not load the activity.")}
            onRetry={() => void activity.refetch()}
          />
        ) : !groups.length ? (
          <EmptyState
            compact
            icon={Activity}
            title="Nothing here yet"
            description={filter ? "No events of this kind." : "Changes to the team will show up here."}
          />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.day}>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">{group.day}</h4>
                <ol>
                  {group.rows.map((row) => (
                    <ActivityItem key={row.id} row={row} />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
      <LoadMore
        hasMore={Boolean(activity.hasNextPage)}
        loading={activity.isFetchingNextPage}
        onMore={() => void activity.fetchNextPage()}
        shown={activity.rows.length}
        noun="events"
      />
    </Panel>
  );
}
