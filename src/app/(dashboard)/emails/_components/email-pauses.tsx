"use client";

import { Clock3, MailX, Megaphone, PauseCircle, PlayCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge, Button, Chip, ConfirmDialog, Field, Input, Panel, Skeleton, Textarea, cx } from "@/components/kit";
import { emailControls, type EmailControls, type EmailPause } from "@/lib/admin/api";
import {
  MAX_CONTROL_REASON,
  PAUSE_LABEL,
  QUICK_PICK_LABEL,
  activePauses,
  lagosInputValue,
  liftedByLabel,
  parseLagosInput,
  pauseBannerText,
  pauseBody,
  pauseCountdown,
  pauseDismissKey,
  pauseInEffect,
  quickPickUntil,
  type PauseKind,
  type QuickPick,
} from "@/lib/admin/email-controls";
import { fullName, when } from "@/lib/admin/format";
import { useEmailControls, useStaffName } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";

import { useControlsWrite } from "./email-controls-ui";

const HOUR = 60 * 60 * 1000;

/** Re-renders every second while something has an `until` to count down to. */
function useNow(ticking: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!ticking) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ticking]);
  return now;
}

const write = (kind: PauseKind) =>
  kind === "marketing" ? emailControls.pauseMarketing : emailControls.pauseNonEssential;

function StaffName({ id }: { id: string | null | undefined }) {
  const staff = useStaffName(id && id !== "SYSTEM" ? id : null);
  if (!id) return null;
  if (id === "SYSTEM") return <>the scheduled lift</>;
  const name = fullName(staff.data);
  return <span title={id}>{name || (staff.isLoading ? "…" : "an admin")}</span>;
}

/**
 * The two pauses at the top of the Emails page. Everyone with the page sees the state; only a
 * super admin gets the Pause and Lift buttons (the core asks for an authenticator code).
 */
export function EmailPausesPanel({ canManage }: { canManage: boolean }) {
  const controls = useEmailControls();
  const data = controls.data;
  const ticking = Boolean(data?.pauseMarketing?.until || data?.pauseNonEssential?.until);
  const now = useNow(ticking);

  if (controls.isError) {
    return (
      <p className="mb-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
        Email controls unavailable: {errorMessage(controls.error)}
      </p>
    );
  }

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
      {(["marketing", "nonEssential"] as const).map((kind) =>
        data ? (
          <PauseCard
            key={kind}
            kind={kind}
            pause={kind === "marketing" ? data.pauseMarketing : data.pauseNonEssential}
            now={now}
            canManage={canManage}
          />
        ) : (
          <Panel key={kind} className="space-y-2 p-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-8 w-28" />
          </Panel>
        ),
      )}
    </div>
  );
}

function PauseCard({
  kind,
  pause,
  now,
  canManage,
}: {
  kind: PauseKind;
  pause: EmailPause;
  now: number;
  canManage: boolean;
}) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const [liftOpen, setLiftOpen] = useState(false);
  const active = pauseInEffect(pause, now);
  const countdown = active ? pauseCountdown(pause.until, now) : null;
  const copy = PAUSE_LABEL[kind];
  const Icon = kind === "marketing" ? Megaphone : MailX;

  return (
    <Panel className={cx("p-4", active && "border-warning/50 bg-warning-soft/40")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cx(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
              active ? "bg-warning-soft text-warning" : "bg-surface text-ink-faint",
            )}
          >
            <Icon size={17} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-ink">{copy.title}</h2>
            <p className="mt-0.5 text-xs text-ink-muted">{copy.scope}</p>
          </div>
        </div>
        {active ? (
          <Badge tone="warning" dot>
            Paused
          </Badge>
        ) : (
          <Badge tone="success" dot>
            Sending
          </Badge>
        )}
      </div>

      {active ? (
        <div className="mt-3 space-y-2 text-xs">
          {pause.reason ? (
            <p className="rounded-lg bg-card/70 px-2.5 py-1.5 text-sm text-ink">
              <span className="font-semibold">Reason:</span> {pause.reason}
            </p>
          ) : null}
          <p className="flex flex-wrap items-center gap-1.5 text-ink-muted">
            <Clock3 size={13} aria-hidden />
            {pause.until ? (
              <>
                Lifts{" "}
                {countdown ? <span className="font-bold tabular-nums text-ink">in {countdown}</span> : "any moment now"}
                <span className="text-ink-faint">({when(pause.until)})</span>
              </>
            ) : (
              "No end set, lift it by hand"
            )}
          </p>
          <p className="text-ink-faint">
            Set by <StaffName id={pause.setBy} />
            {pause.setAt ? `, ${when(pause.setAt)}` : ""}
          </p>
        </div>
      ) : pause.liftedAt ? (
        <p className="mt-3 text-xs text-ink-faint">
          Last pause lifted {when(pause.liftedAt)}
          {pause.liftedBy ? (
            <> by {pause.liftedBy === "SYSTEM" ? liftedByLabel("SYSTEM") : <StaffName id={pause.liftedBy} />}</>
          ) : null}
          .
        </p>
      ) : null}

      {canManage ? (
        <div className="mt-3">
          {active ? (
            <Button size="sm" variant="outline" icon={PlayCircle} onClick={() => setLiftOpen(true)}>
              Lift the pause
            </Button>
          ) : (
            <Button size="sm" variant="outline" icon={PauseCircle} onClick={() => setPauseOpen(true)}>
              Pause
            </Button>
          )}
        </div>
      ) : null}

      <PauseDialog kind={kind} open={pauseOpen} onClose={() => setPauseOpen(false)} />
      <LiftDialog kind={kind} open={liftOpen} onClose={() => setLiftOpen(false)} />
    </Panel>
  );
}

type UntilChoice = "none" | QuickPick | "custom";
const UNTIL_CHOICES: UntilChoice[] = ["none", "1h", "2h", "tomorrow8", "custom"];
const untilChoiceLabel = (choice: UntilChoice) =>
  choice === "none" ? "No end" : choice === "custom" ? "Custom" : QUICK_PICK_LABEL[choice];

function PauseDialog({ kind, open, onClose }: { kind: PauseKind; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [choice, setChoice] = useState<UntilChoice>("none");
  const [custom, setCustom] = useState("");
  const now = useNow(open);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setChoice("none");
    setCustom(lagosInputValue(new Date(Date.now() + 2 * HOUR)));
  }, [open]);

  const until =
    choice === "none"
      ? null
      : choice === "custom"
        ? (parseLagosInput(custom) ?? new Date(Number.NaN))
        : quickPickUntil(choice, now);
  const parsed = pauseBody({ reason, until }, now);
  const untilError = choice === "custom" && !parsed.ok && reason.trim().length >= 3 ? parsed.error : undefined;

  const save = useControlsWrite(
    () => {
      // Quick picks count from the moment of sending, not from when the dialog opened.
      const sendUntil =
        choice === "none" ? null : choice === "custom" ? parseLagosInput(custom) : quickPickUntil(choice);
      const body = pauseBody({ reason, until: sendUntil });
      if (!body.ok) return Promise.reject(new Error(body.error));
      return write(kind)(body.body) as Promise<EmailControls>;
    },
    () => PAUSE_LABEL[kind].short,
    onClose,
  );

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        if (!save.isPending) onClose();
      }}
      onConfirm={() => save.mutate(undefined)}
      tone="warning"
      icon={PauseCircle}
      title={`${PAUSE_LABEL[kind].title}?`}
      description={`${PAUSE_LABEL[kind].scope} Each one held back shows as Skipped on the Messages page. You will be asked for an authenticator code.`}
      confirmLabel="Pause"
      loading={save.isPending}
      disabled={!parsed.ok}
    >
      <div className="space-y-4">
        <Field
          label="Reason"
          hint={`Shown to staff on every page while the pause lasts, and kept in the audit log. ${reason.length}/${MAX_CONTROL_REASON}`}
        >
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, MAX_CONTROL_REASON))}
            placeholder="e.g. SMTP reputation recovery"
            className="min-h-20"
          />
        </Field>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-muted">Lift automatically</p>
          <div className="flex flex-wrap gap-1.5">
            {UNTIL_CHOICES.map((value) => (
              <Chip key={value} active={choice === value} onClick={() => setChoice(value)}>
                {untilChoiceLabel(value)}
              </Chip>
            ))}
          </div>
          {choice === "custom" ? (
            <Field className="mt-3" label="Lift at (Lagos time)" error={untilError}>
              <Input
                type="datetime-local"
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                min={lagosInputValue(new Date(now))}
              />
            </Field>
          ) : null}
          <p className="mt-2 text-xs text-ink-faint">
            {until && !Number.isNaN(until.getTime())
              ? `Lifts ${when(until)} Lagos time, within five minutes. You can lift it earlier.`
              : choice === "none"
                ? "Stays on until someone lifts it."
                : "Pick a time in the future."}
          </p>
        </div>
      </div>
    </ConfirmDialog>
  );
}

function LiftDialog({ kind, open, onClose }: { kind: PauseKind; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);
  const text = reason.trim();
  const save = useControlsWrite(
    () => write(kind)({ active: false, reason: text }) as Promise<EmailControls>,
    () => (kind === "marketing" ? "Marketing emails sending again" : "Non-essential emails sending again"),
    onClose,
  );
  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        if (!save.isPending) onClose();
      }}
      onConfirm={() => save.mutate(undefined)}
      tone="primary"
      icon={PlayCircle}
      title="Lift the pause?"
      description="Emails it held back start sending again straight away. Emails already skipped are not resent. You will be asked for an authenticator code."
      confirmLabel="Lift the pause"
      loading={save.isPending}
      disabled={text.length < 3}
    >
      <Field label="Reason" hint={`Kept in the audit log. ${reason.length}/${MAX_CONTROL_REASON}`}>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value.slice(0, MAX_CONTROL_REASON))}
          placeholder="e.g. Provider recovered"
          className="min-h-20"
        />
      </Field>
    </ConfirmDialog>
  );
}

// ── Shell banner ───────────────────────────────────────────────────────────────

function readDismissed(key: string) {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function saveDismissed(key: string) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* private mode or storage blocked: dismissed for this render only */
  }
}

/**
 * Under the dashboard header while an email pause is in effect, for every staff role that can read
 * the controls. Each pause can be dismissed for the session; a new pause (new `setAt`) shows again.
 * Hidden on the Emails page itself, which shows the full pause cards.
 */
export function EmailPauseBanner() {
  const pathname = usePathname();
  const { can, ready } = useCan();
  const enabled = ready && can("email.controlsRead");
  const controls = useEmailControls(enabled);
  const data = controls.data;
  const ticking = Boolean(data?.pauseMarketing?.until || data?.pauseNonEssential?.until);
  const now = useNow(ticking);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const pauses = enabled ? activePauses(data, now) : [];
  const keys = pauses.map(({ kind, pause }) => pauseDismissKey(kind, pause));
  const keysSig = keys.join("|");
  useEffect(() => {
    if (!keysSig) return;
    setDismissed((prev) => {
      const next = { ...prev };
      for (const key of keysSig.split("|")) if (next[key] === undefined) next[key] = readDismissed(key);
      return next;
    });
  }, [keysSig]);

  const visible = pauses.filter((_, index) => dismissed[keys[index]] === false);
  if (!visible.length || pathname?.startsWith("/emails")) return null;

  return (
    <div role="status" className="border-b border-warning/40 bg-warning-soft px-4 py-2 text-sm sm:px-6">
      <div className="mx-auto max-w-[88rem] space-y-1.5">
        {visible.map(({ kind, pause }) => {
          const key = pauseDismissKey(kind, pause);
          const countdown = pauseCountdown(pause.until, now);
          return (
            <div key={key} className="flex items-center gap-3">
              <MailX size={16} className="shrink-0 text-warning" aria-hidden />
              <p className="min-w-0 flex-1 text-ink sm:truncate">
                <span className="font-bold">{pauseBannerText([{ kind, pause }])}</span>{" "}
                <span className="text-ink-muted">
                  {pause.reason ? `${pause.reason}. ` : ""}
                  {pause.until ? (countdown ? `Lifts in ${countdown}.` : "Lifting now.") : "No end set."}
                </span>
              </p>
              <Link href="/emails" className="shrink-0 text-xs font-bold text-warning hover:underline">
                Manage
              </Link>
              <button
                type="button"
                onClick={() => {
                  saveDismissed(key);
                  setDismissed((prev) => ({ ...prev, [key]: true }));
                }}
                aria-label="Hide this notice for this session"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-card/60 hover:text-ink"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
