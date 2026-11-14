"use client";

import { CheckCircle2, Hand } from "lucide-react";
import { useState } from "react";

import { Button, ConfirmDialog, Field, Textarea } from "@/components/kit";
import { alerts, type AdminAlert } from "@/lib/admin/api";
import { useAction, useMe } from "@/lib/admin/hooks";
import { useCan } from "@/lib/admin/use-can";

/**
 * Claim an alert ("I'm on it", so teammates see who has it) and resolve it with an optional note.
 * Anyone with the ops role can resolve; claiming someone else's alert takes it over.
 */
export const ALERT_INVALIDATE = [["alerts"], ["handoffs"]];

export function useClaimAlert(onSuccess?: (alert: AdminAlert) => void) {
  return useAction((alertId: string) => alerts.claim(alertId), {
    success: "You are handling this alert. Teammates can see it.",
    invalidate: ALERT_INVALIDATE,
    onSuccess: (alert) => onSuccess?.(alert),
  });
}

export function AlertActions({ alert, size = "sm" }: { alert: AdminAlert; size?: "sm" | "md" }) {
  const { can } = useCan();
  const me = useMe();
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  const claim = useClaimAlert();
  const resolve = useAction(() => alerts.resolve(alert.id, note.trim() || undefined), {
    success: "Alert resolved.",
    invalidate: ALERT_INVALIDATE,
    onSuccess: () => {
      setResolving(false);
      setNote("");
    },
  });

  if (alert.status === "RESOLVED" || !can("alert.handle")) return null;
  const mine = alert.status === "CLAIMED" && alert.claimedBy === me.data?._id;

  return (
    <span className="flex flex-wrap justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
      {!mine ? (
        <Button size={size} variant={alert.status === "OPEN" ? "primary" : "outline"} icon={Hand} loading={claim.isPending} onClick={() => claim.mutate(alert.id)}>
          {alert.status === "OPEN" ? "Claim" : "Take over"}
        </Button>
      ) : null}
      <Button size={size} variant={mine ? "primary" : "outline"} icon={CheckCircle2} onClick={() => setResolving(true)}>
        Resolve
      </Button>
      <ConfirmDialog
        open={resolving}
        onClose={() => (resolve.isPending ? undefined : setResolving(false))}
        onConfirm={() => resolve.mutate(undefined)}
        title="Resolve this alert?"
        description={`${alert.title}. It leaves the open list for everyone. If the same problem happens again a new alert opens.`}
        confirmLabel="Resolve"
        icon={CheckCircle2}
        loading={resolve.isPending}
      >
        <Field label="What was done (optional)" hint="Kept on the alert so the next person knows.">
          <Textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Called the rider, they are safe and a new rider is on the way." className="min-h-20" />
        </Field>
      </ConfirmDialog>
    </span>
  );
}
