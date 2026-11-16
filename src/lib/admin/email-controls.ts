import type { Tone } from "@/components/kit";

/**
 * The admin email controls on the Emails page: what kind each email is, whether its switch can
 * move, the one-line status a row shows, and the two pauses (marketing, all non-essential) with
 * their countdowns and quick picks. Pure, so the copy and the Lagos maths are pinned by tests.
 *
 * Source of truth is the core (GET admins/email-templates/controls): `skipReason` says what
 * happens to an email right now, `lockedReason` why its switch is locked. Nothing here decides
 * whether an email sends; it only words what the core said.
 */

export type SkipReason = "DISABLED_BY_ADMIN" | "PAUSED_MARKETING" | "PAUSED_NON_ESSENTIAL";

export type ControlLike = {
  key: string;
  emailChannel?: boolean;
  enabled: boolean;
  essential: boolean;
  essentialReason?: string | null;
  marketing: boolean;
  lockedReason?: string | null;
  disabledReason?: string | null;
  disabledBy?: string | null;
  disabledAt?: string | null;
  skipReason?: SkipReason | string | null;
};

export type PauseLike = {
  active: boolean;
  reason?: string | null;
  until?: string | null;
  setBy?: string | null;
  setAt?: string | null;
  liftedAt?: string | null;
  liftedBy?: string | null;
};

export const MAX_CONTROL_REASON = 280;

// ── Kind ───────────────────────────────────────────────────────────────────────

export type EmailKind = "essential" | "marketing" | "transactional";

/** Essential wins (the core never marks one both); marketing next; everything else is transactional. */
export function emailKind(control: Pick<ControlLike, "essential" | "marketing">): EmailKind {
  if (control.essential) return "essential";
  if (control.marketing) return "marketing";
  return "transactional";
}

export const EMAIL_KIND_LABEL: Record<EmailKind, string> = {
  essential: "Essential",
  marketing: "Marketing",
  transactional: "Transactional",
};
export const EMAIL_KIND_TONE: Record<EmailKind, Tone> = {
  essential: "warning",
  marketing: "brand",
  transactional: "neutral",
};

/** The tooltip on the Essential chip: why it always sends. */
export function kindHint(control: Pick<ControlLike, "essential" | "marketing" | "essentialReason">): string {
  const kind = emailKind(control);
  if (kind === "essential") {
    const reason = control.essentialReason?.trim();
    return reason
      ? `Always sends: ${reason}. It cannot be turned off or paused.`
      : "Always sends. It cannot be turned off or paused.";
  }
  if (kind === "marketing") return "Held back while marketing emails are paused, and by the non-essential pause.";
  return "Held back only by the non-essential pause, or when turned off here.";
}

// ── The switch ─────────────────────────────────────────────────────────────────

export type SwitchLock = { locked: boolean; reason: string | null };

/**
 * Whether this admin may flip the switch, and if not, why. Essential and push-only rows are
 * locked for everyone (the core says why in `lockedReason`); otherwise only a super admin can
 * change it. The core enforces all of this again; this only keeps the UI honest.
 */
export function switchLock(
  control: Pick<ControlLike, "essential" | "essentialReason" | "lockedReason" | "emailChannel">,
  canManage: boolean,
): SwitchLock {
  if (control.essential) {
    const reason =
      control.lockedReason?.trim() ||
      (control.essentialReason ? `Essential: ${control.essentialReason}` : "Essential: always sends");
    return { locked: true, reason };
  }
  if (control.lockedReason?.trim()) return { locked: true, reason: control.lockedReason.trim() };
  if (control.emailChannel === false)
    return { locked: true, reason: "Not sent by email, so there is nothing to turn off." };
  if (!canManage) return { locked: true, reason: "Only a super admin can turn emails on or off." };
  return { locked: false, reason: null };
}

/** The body for PATCH controls/templates/:key, or the reason it cannot be sent yet. */
export function templateSwitchBody(
  enabled: boolean,
  reason: string | null | undefined,
): { ok: true; body: { enabled: boolean; reason?: string } } | { ok: false; error: string } {
  const text = (reason ?? "").trim();
  if (text.length > MAX_CONTROL_REASON)
    return { ok: false, error: `Keep the reason under ${MAX_CONTROL_REASON} characters.` };
  if (!enabled && text.length < 3) return { ok: false, error: "Say why this email is being turned off." };
  return { ok: true, body: text ? { enabled, reason: text } : { enabled } };
}

// ── Status line ────────────────────────────────────────────────────────────────

export type StatusLine = { text: string; tone: Tone; skipping: boolean };

/**
 * One line for a row and the preview: "Sending", "Off: <reason> by <name>", "Paused: marketing",
 * "Paused: all non-essential". `who` is the name of whoever turned it off (falls back to "an admin").
 */
export function emailStatusLine(control: ControlLike, who?: string | null): StatusLine {
  if (control.emailChannel === false) return { text: "Not sent by email", tone: "neutral", skipping: false };
  switch (control.skipReason) {
    case "DISABLED_BY_ADMIN": {
      const reason = control.disabledReason?.trim();
      const by = who?.trim() || "an admin";
      return { text: reason ? `Off: ${reason} by ${by}` : `Off: turned off by ${by}`, tone: "danger", skipping: true };
    }
    case "PAUSED_MARKETING":
      return { text: "Paused: marketing", tone: "warning", skipping: true };
    case "PAUSED_NON_ESSENTIAL":
      return { text: "Paused: all non-essential", tone: "warning", skipping: true };
    case null:
    case undefined:
      return control.enabled
        ? { text: "Sending", tone: "success", skipping: false }
        : { text: "Off", tone: "danger", skipping: true };
    default:
      return {
        text: `Held back: ${String(control.skipReason).toLowerCase().replace(/_/g, " ")}`,
        tone: "warning",
        skipping: true,
      };
  }
}

/** Gallery rows (the list endpoint) merged with the controls by key, so a row has `skipReason` and notes. */
export function controlFor<
  T extends {
    key: string;
    enabled?: boolean;
    essential?: boolean;
    marketing?: boolean;
    essentialReason?: string | null;
  },
>(template: T, controls: readonly ControlLike[] | null | undefined): ControlLike {
  const found = (controls ?? []).find((row) => row.key === template.key);
  if (found) return found;
  return {
    key: template.key,
    enabled: template.enabled ?? true,
    essential: template.essential ?? false,
    essentialReason: template.essentialReason ?? null,
    marketing: template.marketing ?? false,
    skipReason: null,
  };
}

// ── Pauses ─────────────────────────────────────────────────────────────────────

export type PauseKind = "marketing" | "nonEssential";

export const PAUSE_LABEL: Record<PauseKind, { title: string; short: string; scope: string }> = {
  marketing: {
    title: "Pause marketing emails",
    short: "Marketing emails paused",
    scope: "Marketing, launch and referral emails are held back. Everything else sends.",
  },
  nonEssential: {
    title: "Pause all non-essential emails",
    short: "Non-essential emails paused",
    scope:
      "Every email that is not essential is held back. Codes, security notices, invitations and money receipts still send.",
  },
};

/** True while a pause holds emails back: active and its `until` (if any) still ahead. */
export function pauseInEffect(pause: PauseLike | null | undefined, now = Date.now()): boolean {
  if (!pause?.active) return false;
  if (!pause.until) return true;
  const end = new Date(pause.until).getTime();
  return Number.isNaN(end) || end > now;
}

/** "2h 05m" / "3d 4h" / "4:09" until the pause lifts itself; null when open-ended or already past. */
export function pauseCountdown(until: string | null | undefined, now = Date.now()): string | null {
  if (!until) return null;
  const end = new Date(until).getTime();
  if (Number.isNaN(end) || end <= now) return null;
  const total = Math.floor((end - now) / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** The pauses holding emails back right now, in the order the banner lists them. */
export function activePauses(
  controls: { pauseMarketing?: PauseLike | null; pauseNonEssential?: PauseLike | null } | null | undefined,
  now = Date.now(),
): { kind: PauseKind; pause: PauseLike }[] {
  const out: { kind: PauseKind; pause: PauseLike }[] = [];
  if (controls?.pauseNonEssential && pauseInEffect(controls.pauseNonEssential, now))
    out.push({ kind: "nonEssential", pause: controls.pauseNonEssential });
  if (controls?.pauseMarketing && pauseInEffect(controls.pauseMarketing, now))
    out.push({ kind: "marketing", pause: controls.pauseMarketing });
  return out;
}

/** Session key for a dismissed banner: one per pause instance, so a new pause shows again. */
export function pauseDismissKey(kind: PauseKind, pause: Pick<PauseLike, "setAt">) {
  return `email-pause-dismissed:${kind}:${pause.setAt ?? "unknown"}`;
}

/** The banner sentence for the pauses in effect. */
export function pauseBannerText(pauses: readonly { kind: PauseKind; pause: PauseLike }[]): string {
  if (!pauses.length) return "";
  if (pauses.some((p) => p.kind === "nonEssential")) return "Non-essential emails are paused platform-wide.";
  return "Marketing emails are paused platform-wide.";
}

// ── Lagos time: quick picks and the custom input ────────────────────────────────

/** Lagos is UTC+1 all year (no daylight saving). */
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

export type QuickPick = "1h" | "2h" | "tomorrow8";

export const QUICK_PICK_LABEL: Record<QuickPick, string> = {
  "1h": "1 hour",
  "2h": "2 hours",
  tomorrow8: "Tomorrow 8 AM",
};

/** When a quick pick ends. "Tomorrow 8 AM" is 08:00 on the next Lagos calendar day. */
export function quickPickUntil(pick: QuickPick, now = Date.now()): Date {
  if (pick === "1h") return new Date(now + HOUR);
  if (pick === "2h") return new Date(now + 2 * HOUR);
  const lagos = new Date(now + LAGOS_OFFSET_MS);
  const eightLagosAsUtc = Date.UTC(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate() + 1, 8, 0, 0, 0);
  return new Date(eightLagosAsUtc - LAGOS_OFFSET_MS);
}

/** A datetime-local value (YYYY-MM-DDTHH:mm) showing this instant in Lagos time. */
export function lagosInputValue(date: Date): string {
  const lagos = new Date(date.getTime() + LAGOS_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${lagos.getUTCFullYear()}-${pad(lagos.getUTCMonth() + 1)}-${pad(lagos.getUTCDate())}T${pad(lagos.getUTCHours())}:${pad(lagos.getUTCMinutes())}`;
}

/** A datetime-local value read as Lagos time; null when it is not a full date and time. */
export function parseLagosInput(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec((value ?? "").trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const utc = Date.UTC(y, mo - 1, d, h, mi) - LAGOS_OFFSET_MS;
  const date = new Date(utc);
  // Reject values Date.UTC rolled over (e.g. 2026-02-30).
  if (lagosInputValue(date) !== value?.trim()) return null;
  return date;
}

/** The body for PATCH controls/pause-*, or the reason it cannot be sent yet. */
export function pauseBody(
  input: { reason: string; until?: Date | null },
  now = Date.now(),
): { ok: true; body: { active: true; reason: string; until?: string } } | { ok: false; error: string } {
  const reason = input.reason.trim();
  if (reason.length < 3) return { ok: false, error: "Say why emails are being paused." };
  if (reason.length > MAX_CONTROL_REASON)
    return { ok: false, error: `Keep the reason under ${MAX_CONTROL_REASON} characters.` };
  if (input.until) {
    if (Number.isNaN(input.until.getTime()) || input.until.getTime() <= now)
      return { ok: false, error: "Pick a time in the future." };
    return { ok: true, body: { active: true, reason, until: input.until.toISOString() } };
  }
  return { ok: true, body: { active: true, reason } };
}

/** Who lifted the last pause, in words. */
export function liftedByLabel(liftedBy: string | null | undefined, name?: string | null): string {
  if (!liftedBy) return "";
  if (liftedBy === "SYSTEM") return "the scheduled lift";
  return name?.trim() || "an admin";
}
