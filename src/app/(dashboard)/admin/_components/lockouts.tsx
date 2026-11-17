"use client";

import { LockKeyhole, LockKeyholeOpen, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Badge, Button, ConfirmDialog, Input, KeyValue, Panel, PanelHeader, Skeleton } from "@/components/kit";
import { security } from "@/lib/admin/api";
import { waitLabel } from "@/lib/admin/auth-errors";
import { formatEmail, when } from "@/lib/admin/format";
import { useAction, useLockoutStatus } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";

/**
 * "Locked out": look a staff sign-in up by email and see whether repeated wrong passwords or
 * codes locked it, for how long, and clear the lock (super admin). The core locks unknown emails
 * the same way, so a lookup never reveals whether an account exists.
 */
export function LockoutsPanel() {
  const { can } = useCan();
  const [draft, setDraft] = useState("");
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const status = useLockoutStatus(email);
  const unlock = useAction((value: string) => security.unlock(value), {
    success: "Sign-in unlocked",
    invalidate: [["security", "lockout", email]],
    onSuccess: () => setConfirm(false),
  });

  if (!can("security.lockouts")) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setEmail(formatEmail(draft));
  };
  const data = status.data;

  return (
    <Panel>
      <PanelHeader
        title="Locked out"
        subtitle="Five wrong passwords or codes lock a sign-in for a growing wait. Look an email up and clear the lock."
      />
      <div className="px-6 pb-6 pt-4">
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="ops@pickriders.com"
            left={<Search size={14} />}
            aria-label="Email to look up"
            className="sm:max-w-sm"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={!draft.trim()}
            loading={status.isFetching && Boolean(email)}
          >
            Look up
          </Button>
        </form>

        {email ? (
          <div className="mt-4">
            {status.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : status.isError ? (
              <p className="text-sm font-semibold text-danger">
                {errorMessage(status.error, "Could not look this email up.")}
              </p>
            ) : data ? (
              <div className="rounded-xl border border-line bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    {data.locked ? (
                      <LockKeyhole size={15} className="text-danger" />
                    ) : (
                      <LockKeyholeOpen size={15} className="text-success" />
                    )}
                    {email}
                  </p>
                  <Badge tone={data.locked ? "danger" : "success"} dot>
                    {data.locked ? `Locked, ${waitLabel(data.retryAfterSeconds)} left` : "Not locked"}
                  </Badge>
                </div>
                <div className="mt-3">
                  <KeyValue
                    columns={3}
                    items={[
                      { label: "Wrong attempts since last lock", value: String(data.failures) },
                      { label: "Locks in the last day", value: String(data.locks) },
                      { label: "Locked until", value: data.lockedUntil ? when(data.lockedUntil) : "Not locked" },
                    ]}
                  />
                </div>
                {(data.locked || data.failures > 0) && can("security.unlock") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={LockKeyholeOpen}
                    className="mt-3"
                    onClick={() => setConfirm(true)}
                  >
                    {data.locked ? "Unlock sign-in" : "Reset attempts"}
                  </Button>
                ) : data.locked ? (
                  <p className="mt-3 text-xs text-ink-faint">Only a super admin can clear a lock.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => unlock.mutate(email)}
        tone="warning"
        icon={LockKeyholeOpen}
        title="Unlock this sign-in?"
        description={`${email} can try again straight away. Make sure you have spoken to the person: a lock usually means someone was guessing their password.`}
        confirmLabel="Unlock"
        loading={unlock.isPending}
      />
    </Panel>
  );
}
