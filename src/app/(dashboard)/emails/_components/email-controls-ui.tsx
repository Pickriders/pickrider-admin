"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, PowerOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, ConfirmDialog, Field, Switch, Textarea, cx } from "@/components/kit";
import { emailControls, type EmailControls } from "@/lib/admin/api";
import {
  EMAIL_KIND_LABEL,
  EMAIL_KIND_TONE,
  MAX_CONTROL_REASON,
  emailKind,
  emailStatusLine,
  kindHint,
  switchLock,
  templateSwitchBody,
  type ControlLike,
} from "@/lib/admin/email-controls";
import { templateTitle } from "@/lib/admin/emails";
import { fullName } from "@/lib/admin/format";
import { EMAIL_CONTROLS_KEY, useStaffName } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { isStepUpCancelled } from "@/services";

/**
 * Every write to the email controls answers the full controls document: it replaces the cached
 * copy at once (the banner and gallery update without a refetch) and the gallery list, which
 * carries `enabled` too, is refetched. A dismissed step-up prompt is not an error worth a toast.
 */
export function useControlsWrite<TVars>(fn: (vars: TVars) => Promise<EmailControls>, success: (vars: TVars) => string, onDone?: () => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      client.setQueryData(EMAIL_CONTROLS_KEY, data);
      void client.invalidateQueries({ queryKey: ["email-templates", "list"] });
      toast.success(success(vars));
      onDone?.();
    },
    onError: (error) => {
      if (!isStepUpCancelled(error)) toast.error(errorMessage(error, "Could not change the email controls."));
    },
  });
}

/** Essential (with a lock and why), Marketing or Transactional. The reason is in the tooltip. */
export function KindChip({ control, onDark }: { control: ControlLike; onDark?: boolean }) {
  const kind = emailKind(control);
  const hint = kindHint(control);
  return (
    <span title={hint} className="inline-flex">
      <Badge tone={onDark ? "neutral" : EMAIL_KIND_TONE[kind]} className={onDark ? "border-transparent bg-card/15 text-card" : undefined}>
        {kind === "essential" ? <Lock size={10} aria-hidden /> : null}
        {EMAIL_KIND_LABEL[kind]}
        <span className="sr-only">. {hint}</span>
      </Badge>
    </span>
  );
}

const DOT: Record<string, string> = {
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
  neutral: "bg-ink-faint",
  info: "bg-info",
  brand: "bg-brand",
};
const TEXT: Record<string, string> = {
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  neutral: "text-ink-muted",
  info: "text-info",
  brand: "text-brand-dark",
};

/** "Sending" / "Off: <reason> by <name>" / "Paused: marketing", from the core's skipReason. */
export function StatusLine({ control, onDark, className }: { control: ControlLike; onDark?: boolean; className?: string }) {
  const byId = control.skipReason === "DISABLED_BY_ADMIN" ? control.disabledBy : null;
  const staff = useStaffName(byId);
  const line = emailStatusLine(control, fullName(staff.data) || null);
  return (
    <span className={cx("flex min-w-0 items-center gap-1.5 text-[11px] font-semibold", onDark ? "text-card/80" : TEXT[line.tone], className)}>
      <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", DOT[line.tone])} aria-hidden />
      <span className="truncate" title={line.text}>
        {line.text}
      </span>
    </span>
  );
}

/**
 * The on/off switch for one email. Locked (with why) for essential and push-only emails; hidden
 * entirely unless the viewer can manage (super admin). Turning off asks for a reason first;
 * turning back on goes straight through. The core asks for an authenticator code either way.
 */
export function TemplateSwitch({ control, canManage, withLabel }: { control: ControlLike; canManage: boolean; withLabel?: boolean }) {
  const [offOpen, setOffOpen] = useState(false);
  const [reason, setReason] = useState("");
  const lock = switchLock(control, canManage);
  const title = templateTitle(control.key);

  const write = useControlsWrite(
    (body: { enabled: boolean; reason?: string }) => emailControls.setTemplate(control.key, body),
    (body) => (body.enabled ? `${title} email turned back on` : `${title} email turned off`),
    () => {
      setOffOpen(false);
      setReason("");
    },
  );

  if (!canManage) return null;

  const parsed = templateSwitchBody(false, reason);
  const label = withLabel ? (
    <span className="inline-flex items-center gap-1.5">
      {lock.locked ? <Lock size={13} className="text-ink-faint" aria-hidden /> : null}
      {control.enabled ? "On" : "Off"}
    </span>
  ) : undefined;

  return (
    <>
      <span className="inline-flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
        {lock.locked && !withLabel ? <Lock size={12} className="text-ink-faint" aria-hidden /> : null}
        <Switch
          size={withLabel ? "md" : "sm"}
          checked={control.enabled}
          disabled={lock.locked || write.isPending}
          title={lock.reason ?? (control.enabled ? `Turn the ${title.toLowerCase()} email off` : `Turn the ${title.toLowerCase()} email back on`)}
          ariaLabel={`${title} email ${control.enabled ? "on" : "off"}${lock.reason ? `. Locked: ${lock.reason}` : ""}`}
          label={label}
          onChange={(next) => {
            if (next) write.mutate({ enabled: true });
            else setOffOpen(true);
          }}
        />
      </span>
      <ConfirmDialog
        open={offOpen}
        onClose={() => {
          if (write.isPending) return;
          setOffOpen(false);
          setReason("");
        }}
        onConfirm={() => {
          if (parsed.ok) write.mutate(parsed.body);
        }}
        tone="warning"
        icon={PowerOff}
        title={`Turn off the ${title.toLowerCase()} email?`}
        description="Nobody receives it until it is turned back on. Each one held back shows as Skipped on the Messages page. You will be asked for an authenticator code."
        confirmLabel="Turn off"
        loading={write.isPending}
        disabled={!parsed.ok}
      >
        <Field label="Reason" hint={`Shown on this page and kept in the audit log. ${reason.length}/${MAX_CONTROL_REASON}`}>
          <Textarea
            value={reason}
            autoFocus
            onChange={(event) => setReason(event.target.value.slice(0, MAX_CONTROL_REASON))}
            placeholder="e.g. Copy is being rewritten"
            className="min-h-20"
          />
        </Field>
      </ConfirmDialog>
    </>
  );
}
