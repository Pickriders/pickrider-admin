"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { CodeInput } from "@/components/kit/code-input";
import { Button, Input, cx } from "@/components/kit/primitives";
import { settingsHref } from "@/lib/admin/settings-tabs";
import { settleStepUp, subscribeStepUp, type StepUpRequest } from "@/lib/admin/step-up";

/**
 * Mounted once in the dashboard shell. When a request comes back 428 MFA_STEP_UP_REQUIRED the
 * API client asks here for a fresh authenticator code and retries with it; cancelling rejects
 * the request without changing anything. An admin with no authenticator yet is pointed to setup.
 */
export function StepUpDialog() {
  const [request, setRequest] = useState<StepUpRequest | null>(null);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);

  useEffect(() => subscribeStepUp(setRequest), []);
  useEffect(() => {
    if (request) {
      setCode("");
      setRecovery("");
      setUseRecovery(false);
    }
  }, [request]);
  useEffect(() => {
    if (!request) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") settleStepUp(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [request]);

  if (!request || typeof document === "undefined") return null;
  const needsSetup = request.details.mfaEnabled === false;
  const fresh = request.details.freshForMinutes;

  const submit = (value?: string) => {
    const typed = useRecovery ? recovery.trim().toUpperCase() : (value ?? code);
    if (!typed || (!useRecovery && typed.length < 6)) return;
    settleStepUp(typed);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={() => settleStepUp(null)} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="step-up-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-card shadow-pop admin-fade-up"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand/15 to-transparent" />
        <div className="relative px-6 pb-6 pt-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
            {useRecovery ? <KeyRound size={22} /> : <ShieldCheck size={22} />}
          </span>
          <h2 id="step-up-title" className="mt-4 text-lg font-black tracking-tight text-ink">
            {needsSetup ? "Set up your authenticator first" : "Confirm it is you"}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {needsSetup
              ? "This action needs a fresh authenticator code and your account has no authenticator yet. Set one up in Settings, Security, then try again."
              : `${request.purpose ? `${request.purpose} is` : "This action is"} sensitive, so it needs a code from your authenticator app${fresh ? ` (good for ${fresh} minutes)` : ""}.`}
          </p>

          {needsSetup ? (
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => settleStepUp(null)}>
                Cancel
              </Button>
              <Link
                href={settingsHref("security")}
                onClick={() => settleStepUp(null)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-ink shadow-sm hover:bg-brand-dark"
              >
                Open Security settings
              </Link>
            </div>
          ) : (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              {useRecovery ? (
                <Input
                  autoFocus
                  value={recovery}
                  onChange={(event) => setRecovery(event.target.value)}
                  placeholder="XXXXX-XXXXX"
                  autoComplete="off"
                  className="font-mono uppercase tracking-widest"
                  aria-label="Recovery code"
                />
              ) : (
                <CodeInput value={code} onChange={setCode} onComplete={(value) => submit(value)} autoFocus />
              )}
              <button
                type="button"
                onClick={() => setUseRecovery((v) => !v)}
                className="mt-3 text-xs font-bold text-brand-dark hover:underline"
              >
                {useRecovery ? "Use my authenticator app instead" : "Use a recovery code"}
              </button>
              <div className={cx("mt-5 grid grid-cols-2 gap-2")}>
                <Button type="button" variant="outline" onClick={() => settleStepUp(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={useRecovery ? !recovery.trim() : code.length < 6}>
                  Confirm
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
