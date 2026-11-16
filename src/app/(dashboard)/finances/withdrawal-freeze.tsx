"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock3, LockKeyhole, LockKeyholeOpen, Snowflake } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  Field,
  Input,
  KeyValue,
  Panel,
  PanelHeader,
  Skeleton,
  Textarea,
} from "@/components/kit";
import { platformSettings, type WithdrawalFreeze } from "@/lib/admin/api";
import { when } from "@/lib/admin/format";
import { useAction, usePlatformSettings } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";
import { isStepUpCancelled } from "@/services";

/**
 * The platform-wide withdrawal freeze: every wallet withdrawal is refused while it is on, with
 * the reason shown to riders and customers. Lives on the Finances page (Withdrawals tab); the
 * banner version sits under the dashboard header while a freeze is active. Freezing and lifting
 * go through PATCH platform-settings, which the core protects with a fresh authenticator code.
 */
const MAX_REASON = 280;

/** "2h 05m" / "3d 4h" / "0:45" until the freeze lifts itself; null when open-ended or past. */
export function countdownLabel(until: string | null | undefined, now = Date.now()): string | null {
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

/** A datetime-local value for the input, in the browser's zone. */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function useCountdown(until: string | null | undefined) {
  const [label, setLabel] = useState<string | null>(() => countdownLabel(until));
  useEffect(() => {
    setLabel(countdownLabel(until));
    if (!until) return;
    const timer = window.setInterval(() => setLabel(countdownLabel(until)), 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  return label;
}

export function WithdrawalFreezeCard() {
  const { can } = useCan();
  const query = usePlatformSettings();
  const client = useQueryClient();
  const freeze: WithdrawalFreeze | undefined = query.data?.withdrawalsFrozen;
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [liftOpen, setLiftOpen] = useState(false);
  const countdown = useCountdown(freeze?.active ? freeze.until : null);
  const canWrite = can("withdrawals.freeze");

  const lift = useAction(() => platformSettings.update({ withdrawalsFrozen: { active: false } }), {
    success: "Withdrawals resumed",
    invalidate: [["settings", "platform"]],
    onSuccess: () => setLiftOpen(false),
    error: (error) => errorMessage(error, "Could not lift the freeze."),
  });

  return (
    <Panel className={freeze?.active ? "border-info/40" : undefined}>
      <PanelHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Snowflake size={15} className={freeze?.active ? "text-info" : "text-ink-faint"} />
            Platform withdrawal freeze
          </span>
        }
        subtitle="Pause every wallet withdrawal at once, for everyone, with a reason riders and customers see"
        action={
          query.isLoading ? null : freeze?.active ? (
            <Badge tone="info" dot>
              Frozen
            </Badge>
          ) : (
            <Badge tone="success" dot>
              Withdrawals open
            </Badge>
          )
        }
      />
      <div className="px-6 pb-6 pt-4">
        {query.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : query.isError ? (
          <p className="text-sm font-semibold text-danger">
            {errorMessage(query.error, "Could not load the freeze state.")}
          </p>
        ) : freeze?.active ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-info/40 bg-info-soft px-4 py-3 text-sm">
              <p className="font-bold text-ink">{freeze.message || "Withdrawals are paused for everyone."}</p>
              {freeze.reason ? <p className="mt-0.5 text-ink-muted">Reason: {freeze.reason}</p> : null}
            </div>
            <KeyValue
              columns={3}
              items={[
                { label: "Since", value: freeze.setAt ? when(freeze.setAt) : undefined },
                {
                  label: "Set by",
                  value: freeze.setBy ? <span className="font-mono text-xs">{freeze.setBy}</span> : undefined,
                },
                {
                  label: "Lifts automatically",
                  value: freeze.until ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} className="text-ink-muted" />
                      {countdown ? `in ${countdown}` : "any moment now"}{" "}
                      <span className="text-ink-faint">({when(freeze.until)})</span>
                    </span>
                  ) : (
                    "Not scheduled, lift it by hand"
                  ),
                },
              ]}
            />
            {canWrite ? (
              <Button variant="outline" icon={LockKeyholeOpen} onClick={() => setLiftOpen(true)}>
                Lift the freeze now
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Use this when a provider is failing, a reconciliation is running or you suspect fraud across accounts. A
              per-account restriction (on the rider&apos;s record) is the tool for one person.
            </p>
            {freeze?.liftedAt ? (
              <p className="text-xs text-ink-faint">
                Last freeze lifted {when(freeze.liftedAt)}
                {freeze.liftedBy ? ` by ${freeze.liftedBy === "SYSTEM" ? "the scheduled lift" : freeze.liftedBy}` : ""}.
              </p>
            ) : null}
            {canWrite ? (
              <Button variant="outline" icon={LockKeyhole} className="text-info" onClick={() => setFreezeOpen(true)}>
                Freeze withdrawals
              </Button>
            ) : null}
          </div>
        )}
      </div>

      <FreezeDrawer
        open={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        onSaved={() => void client.invalidateQueries({ queryKey: ["settings", "platform"] })}
      />
      <ConfirmDialog
        open={liftOpen}
        onClose={() => setLiftOpen(false)}
        onConfirm={() => lift.mutate(undefined)}
        tone="primary"
        icon={LockKeyholeOpen}
        title="Lift the withdrawal freeze?"
        description="Withdrawals resume for everyone straight away. You will be asked for an authenticator code. The lift is written to the audit log."
        confirmLabel="Resume withdrawals"
        loading={lift.isPending}
      />
    </Panel>
  );
}

function FreezeDrawer({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [reason, setReason] = useState("");
  const [untilOn, setUntilOn] = useState(false);
  const [until, setUntil] = useState("");
  useEffect(() => {
    if (open) {
      setReason("");
      setUntilOn(false);
      setUntil(toLocalInput(new Date(Date.now() + 2 * 60 * 60 * 1000)));
    }
  }, [open]);

  const untilDate = untilOn && until ? new Date(until) : null;
  const untilInvalid =
    untilOn && (!untilDate || Number.isNaN(untilDate.getTime()) || untilDate.getTime() <= Date.now());

  const save = useMutation({
    mutationFn: () =>
      platformSettings.update({
        withdrawalsFrozen: {
          active: true,
          reason: reason.trim(),
          until: untilDate && !untilInvalid ? untilDate.toISOString() : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Withdrawals frozen");
      onSaved();
      onClose();
    },
    onError: (error) => {
      if (!isStepUpCancelled(error)) toast.error(errorMessage(error, "Could not freeze withdrawals."));
    },
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Freeze withdrawals"
      subtitle="Every wallet withdrawal on the platform is refused until this is lifted."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={LockKeyhole}
            loading={save.isPending}
            disabled={reason.trim().length < 3 || untilInvalid}
            onClick={() => save.mutate()}
          >
            Freeze withdrawals
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field
          label="Reason"
          hint={`Shown to riders and customers when they try to withdraw, and kept in the audit log. ${reason.length}/${MAX_REASON}`}
        >
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
            placeholder="e.g. Our payout provider is down. Withdrawals resume as soon as transfers clear."
          />
        </Field>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={untilOn}
            onChange={(e) => setUntilOn(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
          />
          <span>
            <span className="block font-semibold text-ink">Lift automatically</span>
            <span className="block text-xs text-ink-muted">
              The core lifts the freeze within five minutes of this time. Leave off for an open-ended pause.
            </span>
          </span>
        </label>
        {untilOn ? (
          <Field label="Lift at" error={untilInvalid ? "Pick a time in the future." : undefined}>
            <Input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              min={toLocalInput(new Date())}
            />
          </Field>
        ) : null}
        <p className="text-xs text-ink-faint">
          You will be asked for a code from your authenticator app before this goes through.
        </p>
      </div>
    </Drawer>
  );
}

/** Under the dashboard header while a freeze is active, for every staff role. */
export function WithdrawalFreezeBanner() {
  const query = usePlatformSettings();
  const freeze = query.data?.withdrawalsFrozen;
  const countdown = useCountdown(freeze?.active ? freeze.until : null);
  if (!freeze?.active) return null;
  return (
    <div role="status" className="border-b border-info/40 bg-info-soft px-4 py-2.5 text-sm sm:px-6">
      <div className="mx-auto flex max-w-[88rem] items-center gap-3">
        <Snowflake size={16} className="shrink-0 text-info" />
        <p className="min-w-0 flex-1 truncate text-ink">
          <span className="font-bold">Withdrawals are frozen platform-wide.</span>{" "}
          <span className="text-ink-muted">
            {freeze.reason ? `${freeze.reason} ` : ""}
            {freeze.until ? (countdown ? `Lifts in ${countdown}.` : "Lifting now.") : "No automatic lift scheduled."}
          </span>
        </p>
        <Link href="/finances?tab=withdrawals" className="shrink-0 text-xs font-bold text-info hover:underline">
          Manage
        </Link>
      </div>
    </div>
  );
}
