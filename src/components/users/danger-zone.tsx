"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CircleX, ShieldAlert, Trash2, UserRoundX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button, Drawer, Field, Input, Panel, PanelHeader, Skeleton, Textarea, cx } from "@/components/kit";
import { users, type EraseUserResult, type User } from "@/lib/admin/api";
import { apiErrorCode } from "@/lib/admin/auth-errors";
import { fullName, when } from "@/lib/admin/format";
import { useErasureBlockers } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";
import { isStepUpCancelled } from "@/services";

import { erasureChecklist, erasureConfirmMatches, erasureConfirmTarget, type ErasureCheck } from "./erasure";

/**
 * Danger zone on a customer or courier record: erase the account for good. Super admin only.
 * The flow fetches what blocks the erasure first and shows it as a checklist; only when every
 * line is clear does the confirmation form appear (type the phone or email, give a reason).
 * The core asks for a fresh authenticator code (428) and the API client prompts for it.
 */
export function DangerZone({ user, listHref, kind }: { user: User; listHref: string; kind: "customer" | "courier" }) {
  const { can } = useCan();
  const [open, setOpen] = useState(false);
  if (!can("user.erase")) return null;
  return (
    <>
      <Panel className="border-danger/40">
        <PanelHeader
          title={
            <span className="inline-flex items-center gap-2 text-danger">
              <ShieldAlert size={15} />
              Danger zone
            </span>
          }
          subtitle="Irreversible actions on this account"
        />
        <div className="flex flex-col gap-3 px-6 pb-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-bold text-ink">Erase account</p>
            <p className="text-ink-muted">
              Deletes the {kind}&apos;s record and personal data. Orders, payments and wallet history stay for the
              books, pointing at an anonymous tombstone.
            </p>
          </div>
          <Button
            variant="outline"
            icon={Trash2}
            className="shrink-0 border-danger/40 text-danger hover:bg-danger-soft"
            onClick={() => setOpen(true)}
          >
            Erase account
          </Button>
        </div>
      </Panel>
      <EraseDrawer user={user} open={open} onClose={() => setOpen(false)} listHref={listHref} kind={kind} />
    </>
  );
}

function ChecklistLine({ check }: { check: ErasureCheck }) {
  return (
    <li className="flex items-start gap-2.5 py-2">
      {check.ok ? (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
      ) : (
        <CircleX size={16} className="mt-0.5 shrink-0 text-danger" />
      )}
      <div className="min-w-0 text-sm">
        <p className={cx("font-semibold", check.ok ? "text-ink" : "text-danger")}>{check.label}</p>
        {check.detail ? <p className="text-xs text-ink-muted">{check.detail}</p> : null}
      </div>
    </li>
  );
}

export function EraseDrawer({
  user,
  open,
  onClose,
  listHref,
  kind,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  listHref: string;
  kind: "customer" | "courier";
}) {
  const router = useRouter();
  const client = useQueryClient();
  const blockers = useErasureBlockers(user._id, open);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState<EraseUserResult | null>(null);

  useEffect(() => {
    if (open) {
      setTyped("");
      setReason("");
      setNote("");
      setDone(null);
    }
  }, [open]);

  const erase = useMutation({
    mutationFn: () => users.erase(user._id, { reason: reason.trim(), note: note.trim() || undefined }),
    onSuccess: (result) => {
      setDone(result);
      void client.invalidateQueries({ queryKey: [kind === "customer" ? "customers" : "users"] });
      void client.invalidateQueries({ queryKey: ["orders"] });
      void client.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Account erased");
    },
    onError: (error) => {
      if (isStepUpCancelled(error)) return;
      if (apiErrorCode(error) === "ERASURE_BLOCKED") {
        toast.error("Something now blocks this erasure. The checklist was refreshed.");
        void blockers.refetch();
        return;
      }
      toast.error(errorMessage(error, "Could not erase this account."));
    },
  });

  const target = erasureConfirmTarget(user);
  const checklist = erasureChecklist(blockers.data?.blockers);
  const canErase = Boolean(blockers.data?.canErase) && checklist.every((c) => c.ok);
  const ready = canErase && erasureConfirmMatches(typed, target) && reason.trim().length >= 3;
  const name = fullName(user) || `this ${kind}`;
  const summary = (done?.summary as Record<string, number> | undefined) ?? {};

  return (
    <Drawer
      open={open}
      onClose={erase.isPending ? () => undefined : onClose}
      width="sm"
      title={done ? "Account erased" : `Erase ${name}`}
      subtitle={done ? `Erased ${when(done.erasedAt)}` : "Super admin only. This cannot be undone."}
      footer={
        done ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Stay here
            </Button>
            <Button onClick={() => router.push(listHref)}>Back to the list</Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={erase.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={UserRoundX}
              loading={erase.isPending}
              disabled={!ready}
              onClick={() => erase.mutate()}
            >
              Erase account
            </Button>
          </div>
        )
      }
    >
      {done ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success-soft px-4 py-3 text-sm">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
            <div>
              <p className="font-bold text-ink">{done.message}</p>
              <p className="text-ink-muted">
                Records that referred to this account now point at tombstone{" "}
                <span className="font-mono text-xs">{done.tombstoneId}</span> and read &quot;Erased user&quot;.
              </p>
            </div>
          </div>
          {Object.keys(summary).length ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-ink-muted">What was re-pointed or scrubbed</p>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {Object.entries(summary).map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-ink">{key}</span>
                    <span className="font-semibold tabular-nums text-ink-muted">{String(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
            <p className="text-ink">
              The person is emailed that their account was erased, their sign-in stops working at once, and the same
              email or phone cannot open a new account for 30 days.
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-ink-muted">Before the account can go</p>
            {blockers.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : blockers.isError ? (
              <p className="text-sm font-semibold text-danger">
                {errorMessage(blockers.error, "Could not check this account.")}
              </p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line px-3">
                {checklist.map((check) => (
                  <ChecklistLine key={check.code} check={check} />
                ))}
              </ul>
            )}
            {blockers.data && !canErase ? (
              <p className="mt-2 text-xs font-semibold text-danger">Resolve the items marked above, then try again.</p>
            ) : null}
          </div>

          {canErase ? (
            <>
              <Field
                label={`Type the ${target?.label ?? "identifier"} to confirm`}
                hint={target ? `${target.value}` : "This account has no phone or email on record."}
              >
                <Input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={target?.value}
                  autoComplete="off"
                  disabled={!target}
                />
              </Field>
              <Field label="Reason" hint="Kept on the tombstone and the audit trail. 3 to 280 characters.">
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 280))}
                  placeholder="e.g. Data deletion request from the person"
                />
              </Field>
              <Field label="Internal note" hint="Optional, for the audit trail only.">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 1000))}
                  placeholder="Ticket number, who asked, anything the next admin should know"
                />
              </Field>
              <p className="text-xs text-ink-faint">
                You will be asked for a code from your authenticator app before this goes through.
              </p>
            </>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
