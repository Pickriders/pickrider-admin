"use client";

import { useState } from "react";

import { ConfirmDialog, Field, Textarea } from "@/components/kit";
import { developers, type DeveloperKey } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";

import { ACTIONS, REASON_MAX, reasonProblem, type DeveloperActionId } from "./developer-ui";

/** Every staff action refreshes the lists, the queue badge and the open team. */
export const DEVELOPER_INVALIDATE = ["developers"];

const RUN: Record<DeveloperActionId, (teamId: string, reason: string) => Promise<unknown>> = {
  approve: (teamId) => developers.approve(teamId),
  reject: (teamId, reason) => developers.reject(teamId, reason),
  suspendLive: (teamId, reason) => developers.suspendLive(teamId, reason),
  unsuspendLive: (teamId) => developers.unsuspendLive(teamId),
  suspendTeam: (teamId, reason) => developers.suspendTeam(teamId, reason),
  restoreTeam: (teamId) => developers.restoreTeam(teamId),
};

const DONE: Record<DeveloperActionId, string> = {
  approve: "Approved. They can go live now.",
  reject: "Request rejected. They've been told what to fix.",
  suspendLive: "Live access suspended.",
  unsuspendLive: "Live access restored.",
  suspendTeam: "Team suspended. Their keys stop on the next request.",
  restoreTeam: "Team restored.",
};

function ReasonField({
  label,
  placeholder,
  value,
  onChange,
  touched,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  touched: boolean;
}) {
  const problem = reasonProblem(value);
  return (
    <Field
      label={label ?? "Reason"}
      hint={`${value.trim().length}/${REASON_MAX}. The developer sees this.`}
      error={touched && problem ? problem : undefined}
    >
      <Textarea
        autoFocus
        value={value}
        maxLength={REASON_MAX}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-24"
      />
    </Field>
  );
}

/** Confirms one team action, asking for a reason where the developer needs one. */
export function DeveloperActionDialog({
  action,
  team,
  onClose,
}: {
  action: DeveloperActionId | null;
  team: { id: string; name: string };
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const spec = action ? ACTIONS[action] : null;
  const run = useAction(
    (vars: { action: DeveloperActionId; reason: string }) => RUN[vars.action](team.id, vars.reason.trim()),
    {
      success: (_data, vars) => DONE[vars.action],
      invalidate: DEVELOPER_INVALIDATE,
      onSuccess: () => close(),
    },
  );
  const close = () => {
    setReason("");
    setTouched(false);
    onClose();
  };
  const blocked = Boolean(spec?.needsReason && reasonProblem(reason));

  return (
    <ConfirmDialog
      open={Boolean(spec)}
      onClose={() => (run.isPending ? undefined : close())}
      onConfirm={() => {
        setTouched(true);
        if (action && !blocked) run.mutate({ action, reason });
      }}
      title={spec?.title(team.name) ?? ""}
      description={spec?.description}
      confirmLabel={spec?.confirmLabel}
      tone={spec?.tone}
      loading={run.isPending}
      disabled={blocked}
    >
      {spec?.needsReason ? (
        <ReasonField
          label={spec.reasonLabel}
          placeholder={spec.reasonPlaceholder}
          value={reason}
          onChange={(v) => {
            setReason(v);
            setTouched(true);
          }}
          touched={touched}
        />
      ) : null}
    </ConfirmDialog>
  );
}

/** Revokes one key now, for a leaked or misused key, without touching the rest of the team. */
export function RevokeKeyDialog({
  teamId,
  apiKey,
  onClose,
}: {
  teamId: string;
  apiKey: DeveloperKey | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const close = () => {
    setReason("");
    setTouched(false);
    onClose();
  };
  const run = useAction(
    (vars: { keyId: string; reason: string }) => developers.revokeKey(teamId, vars.keyId, vars.reason.trim()),
    {
      success: "Key revoked. It stops working on its next request.",
      invalidate: DEVELOPER_INVALIDATE,
      onSuccess: () => close(),
    },
  );
  const blocked = Boolean(reasonProblem(reason));

  return (
    <ConfirmDialog
      open={Boolean(apiKey)}
      onClose={() => (run.isPending ? undefined : close())}
      onConfirm={() => {
        setTouched(true);
        if (apiKey && !blocked) run.mutate({ keyId: apiKey.id, reason });
      }}
      title={apiKey ? `Revoke ${apiKey.label || apiKey.prefix}?` : ""}
      description={
        <>
          Requests with <span className="font-mono text-ink">{apiKey?.prefix}…</span> are refused with api_key_revoked
          from the next one. The team keeps its other keys and can create a new one. This can&apos;t be undone.
        </>
      }
      confirmLabel="Revoke key"
      tone="danger"
      loading={run.isPending}
      disabled={blocked}
    >
      <ReasonField
        label="Reason (shown to the developer)"
        placeholder="This key was posted in a public repository."
        value={reason}
        onChange={(v) => {
          setReason(v);
          setTouched(true);
        }}
        touched={touched}
      />
    </ConfirmDialog>
  );
}
