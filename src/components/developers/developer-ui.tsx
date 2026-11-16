"use client";

import { Ban, CheckCircle2, Clock, Code2, MinusCircle, PauseCircle, XCircle, type LucideIcon } from "lucide-react";

import { Badge, cx, type Tone } from "@/components/kit";
import type { DeveloperDetail, DeveloperKey, DeveloperLiveStatus, DeveloperRow } from "@/lib/admin/api";

/** Labels and the rules for what staff can do to a developer team. Pure parts are exported for the test. */

export const LIVE_STATUS: Record<DeveloperLiveStatus, { label: string; tone: Tone; icon: LucideIcon; hint: string }> = {
  NOT_REQUESTED: { label: "Test only", tone: "neutral", icon: MinusCircle, hint: "Has not asked for live access" },
  PENDING: { label: "Waiting for review", tone: "warning", icon: Clock, hint: "Asked for live access" },
  APPROVED: { label: "Live", tone: "success", icon: CheckCircle2, hint: "Can create real orders" },
  REJECTED: { label: "Rejected", tone: "danger", icon: XCircle, hint: "Live access was refused; they can ask again" },
  SUSPENDED: {
    label: "Live suspended",
    tone: "danger",
    icon: PauseCircle,
    hint: "Live keys stopped; test keys still work",
  },
};

export const VOLUME_LABEL: Record<NonNullable<DeveloperDetail["expectedMonthlyVolume"]>, string> = {
  UP_TO_100: "Up to 100 a month",
  UP_TO_1000: "Up to 1,000 a month",
  UP_TO_10000: "Up to 10,000 a month",
  OVER_10000: "Over 10,000 a month",
};

const KEY_TONE: Record<DeveloperKey["status"], Tone> = {
  active: "success",
  expiring: "warning",
  expired: "neutral",
  revoked: "danger",
};
const KEY_LABEL: Record<DeveloperKey["status"], string> = {
  active: "Active",
  expiring: "Expiring",
  expired: "Expired",
  revoked: "Revoked",
};

export function LiveStatusBadge({ status }: { status: DeveloperLiveStatus }) {
  const s = LIVE_STATUS[status] ?? LIVE_STATUS.NOT_REQUESTED;
  return (
    <span title={s.hint} className="inline-flex">
      <Badge tone={s.tone}>
        <s.icon size={11} aria-hidden />
        {s.label}
      </Badge>
    </span>
  );
}

/** The whole account, separate from live access: a suspended team's every key is refused. */
export function TeamSuspendedBadge({ team }: { team: Pick<DeveloperRow, "status" | "suspensionReason"> }) {
  if (team.status !== "SUSPENDED") return null;
  return (
    <span title={team.suspensionReason ?? "Every key is refused"} className="inline-flex">
      <Badge tone="danger">
        <Ban size={11} aria-hidden />
        Team suspended
      </Badge>
    </span>
  );
}

export function KeyStatusBadge({ status }: { status: DeveloperKey["status"] }) {
  return <Badge tone={KEY_TONE[status]}>{KEY_LABEL[status]}</Badge>;
}

export function ModeBadge({ livemode }: { livemode: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex h-5 items-center rounded-md px-1.5 font-mono text-[10px] font-bold uppercase tracking-wide",
        livemode ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
      )}
    >
      {livemode ? "live" : "test"}
    </span>
  );
}

export function TeamAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className="grid shrink-0 place-items-center rounded-xl bg-ink font-bold tracking-tight text-card"
    >
      {letters || <Code2 size={Math.round(size * 0.45)} />}
    </span>
  );
}

// ── What staff can do ───────────────────────────────────────────────────────────

export type DeveloperActionId = "approve" | "reject" | "suspendLive" | "unsuspendLive" | "suspendTeam" | "restoreTeam";

export type DeveloperActionSpec = {
  id: DeveloperActionId;
  label: string;
  /** Asked in the confirm dialog. */
  title: (name: string) => string;
  description: string;
  confirmLabel: string;
  tone: "primary" | "warning" | "danger";
  /** A reason the developer will see; 5–500 characters, as the API requires. */
  needsReason: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
};

export const ACTIONS: Record<DeveloperActionId, DeveloperActionSpec> = {
  approve: {
    id: "approve",
    label: "Approve live access",
    title: (name) => `Approve ${name} for live?`,
    description: "They can create live keys and real orders straight away. A live wallet is opened for them.",
    confirmLabel: "Approve",
    tone: "primary",
    needsReason: false,
  },
  reject: {
    id: "reject",
    label: "Reject",
    title: (name) => `Reject ${name}'s request?`,
    description: "They stay in test mode and can fix what you ask, then request again.",
    confirmLabel: "Reject request",
    tone: "warning",
    needsReason: true,
    reasonLabel: "What they need to fix",
    reasonPlaceholder: "Add your company website and describe what you deliver.",
  },
  suspendLive: {
    id: "suspendLive",
    label: "Suspend live access",
    title: (name) => `Suspend live access for ${name}?`,
    description: "Live keys are refused from their next request. Test keys keep working, so they can still build.",
    confirmLabel: "Suspend live",
    tone: "danger",
    needsReason: true,
    reasonLabel: "Reason (shown to the developer)",
    reasonPlaceholder: "Several chargebacks are under review.",
  },
  unsuspendLive: {
    id: "unsuspendLive",
    label: "Restore live access",
    title: (name) => `Restore live access for ${name}?`,
    description: "Their live keys work again from the next request.",
    confirmLabel: "Restore live",
    tone: "primary",
    needsReason: false,
  },
  suspendTeam: {
    id: "suspendTeam",
    label: "Suspend team",
    title: (name) => `Suspend ${name}?`,
    description:
      "Every key, test and live, is refused from its next request with account_suspended. Use this for fraud or abuse.",
    confirmLabel: "Suspend team",
    tone: "danger",
    needsReason: true,
    reasonLabel: "Reason (shown to the developer)",
    reasonPlaceholder: "Suspected fraud on live orders.",
  },
  restoreTeam: {
    id: "restoreTeam",
    label: "Restore team",
    title: (name) => `Restore ${name}?`,
    description: "Their keys work again from the next request. Live access goes back to what it was.",
    confirmLabel: "Restore team",
    tone: "primary",
    needsReason: false,
  },
};

/** The actions a team's state allows, most likely first. Mirrors the backend's transitions. */
export function availableActions(team: Pick<DeveloperRow, "status" | "liveStatus">): DeveloperActionId[] {
  if (team.status === "SUSPENDED") return ["restoreTeam"];
  const live: DeveloperActionId[] =
    team.liveStatus === "PENDING"
      ? ["approve", "reject"]
      : team.liveStatus === "APPROVED"
        ? ["suspendLive"]
        : team.liveStatus === "SUSPENDED"
          ? ["unsuspendLive"]
          : [];
  return [...live, "suspendTeam"];
}

export const REASON_MIN = 5;
export const REASON_MAX = 500;

/** Why the confirm button is off, or null when the reason is fine. */
export function reasonProblem(reason: string): string | null {
  const length = reason.trim().length;
  if (length < REASON_MIN) return `At least ${REASON_MIN} characters, so the developer knows what to do.`;
  if (length > REASON_MAX) return `At most ${REASON_MAX} characters.`;
  return null;
}

/** How long a team has waited for review, for the queue: "2 days", "5 hours", "just now". */
export function waited(since: string | null | undefined, now = Date.now()) {
  if (!since) return "";
  const hours = Math.floor((now - new Date(since).getTime()) / 3_600_000);
  if (hours < 1) return "under an hour";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${Math.floor(hours / 24)} days`;
}
