"use client";

import { ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { day } from "@/lib/admin/format";
import { useMfaStatus } from "@/lib/admin/hooks";
import { settingsHref } from "@/lib/admin/settings-tabs";
import { clearMfaSetupDeadline, getMfaSetupDeadline } from "@/lib/admin/session";

/**
 * "Set up your authenticator app by <date>": shown while sign-in said MFA setup is pending (the
 * deadline is kept in localStorage at sign-in) and the account still has no authenticator.
 * Dismissing hides it for this page load only; it goes away for good once MFA is on.
 */
export function MfaGraceBanner() {
  const [deadline, setDeadline] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => setDeadline(getMfaSetupDeadline()), []);
  const status = useMfaStatus(Boolean(deadline));

  useEffect(() => {
    if (status.data?.enabled) {
      clearMfaSetupDeadline();
      setDeadline(null);
    }
  }, [status.data?.enabled]);

  if (!deadline || hidden || status.data?.enabled) return null;
  const date = new Date(deadline);
  const overdue = !Number.isNaN(date.getTime()) && date.getTime() < Date.now();

  return (
    <div role="status" className="border-b border-warning/40 bg-warning-soft px-4 py-2.5 text-sm sm:px-6">
      <div className="mx-auto flex max-w-[88rem] items-center gap-3">
        <ShieldAlert size={16} className="shrink-0 text-warning" />
        <p className="min-w-0 flex-1 text-ink">
          <span className="font-bold">{overdue ? "Authenticator setup is overdue." : `Set up your authenticator app by ${day(deadline)}.`}</span>{" "}
          <span className="text-ink-muted">Two-step sign-in is required for your role; after the deadline the console locks until it is on.</span>
        </p>
        <Link href={settingsHref("security", { setup: "1" })} className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-card hover:opacity-90">
          Set up now
        </Link>
        <button type="button" onClick={() => setHidden(true)} aria-label="Hide for now" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-card hover:text-ink">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
