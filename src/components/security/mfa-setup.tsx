"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, cx, Skeleton } from "@/components/kit/primitives";
import { CodeInput } from "@/components/kit/code-input";
import { QrCode } from "@/components/kit/qr-code";
import { auth, type MfaEnabled, type MfaSetup } from "@/lib/admin/api";
import { errorMessage } from "@/lib/admin/http";
import { clearMfaSetupDeadline } from "@/lib/admin/session";

import { CopyButton, DownloadButton } from "./copy-button";

/**
 * Authenticator setup, start to finish: the core issues a secret (shown as a QR and as text for
 * manual entry), the admin confirms the first code, and the ten recovery codes are shown once.
 * Used by the setup-only screen (/security/setup) and by "Set up" on the Settings page Security tab.
 */
type Step = { kind: "scan" } | { kind: "codes"; result: MfaEnabled };

/** The otpauth URI's "secret" grouped in fours so it can be typed into an app. */
export function groupSecret(secret: string) {
  return secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** The account label from an otpauth URI, for the caption under the QR. */
export function otpauthAccount(uri: string): string | null {
  const match = /^otpauth:\/\/totp\/([^?]+)/i.exec(uri);
  if (!match) return null;
  const label = decodeURIComponent(match[1]);
  return label.includes(":") ? label.split(":").slice(1).join(":") : label;
}

export function recoveryCodesText(codes: string[]) {
  return ["Pickriders Admin recovery codes", "Each code works once. Keep them somewhere safe.", "", ...codes, ""].join("\n");
}

export function MfaSetupFlow({ onDone, onCancel, compact }: { onDone: () => void; onCancel?: () => void; compact?: boolean }) {
  const client = useQueryClient();
  const [step, setStep] = useState<Step>({ kind: "scan" });
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);

  const start = useMutation({
    mutationFn: auth.mfaSetup,
    onSuccess: (data) => {
      setSetup(data);
      setCode("");
    },
  });
  const verify = useMutation({
    mutationFn: (value: string) => auth.mfaVerify(value),
    onSuccess: (result) => {
      clearMfaSetupDeadline();
      void client.invalidateQueries({ queryKey: ["me"] });
      setStep({ kind: "codes", result });
    },
  });

  const begin = start.mutate;
  useEffect(() => {
    begin();
  }, [begin]);

  if (step.kind === "codes") {
    const codes = step.result.recoveryCodes ?? [];
    return (
      <div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 size={22} />
        </span>
        <h2 className={cx("mt-4 font-bold tracking-tight text-ink", compact ? "text-xl" : "text-2xl")}>Authenticator on</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Save these recovery codes now. Each one signs you in once if you lose your phone. They are shown only this once; you can generate a new set
          from Settings, Security later.
        </p>
        <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface p-4 font-mono text-sm font-semibold tracking-wider text-ink">
          {codes.map((item) => (
            <li key={item} className="tabular-nums">
              {item}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton text={codes.join("\n")} label="Copy codes" />
          <DownloadButton name="pickriders-admin-recovery-codes.txt" text={recoveryCodesText(codes)} />
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm">
          <input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--brand)]" />
          <span className="font-semibold text-ink">I saved these codes somewhere safe</span>
        </label>
        <Button type="button" fullWidth size="lg" className="mt-5" disabled={!saved} icon={ShieldCheck} onClick={onDone}>
          Continue
        </Button>
      </div>
    );
  }

  const account = setup ? otpauthAccount(setup.otpauthUri) : null;
  const error = verify.error ?? start.error;

  return (
    <div>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
        <KeyRound size={22} />
      </span>
      <h2 className={cx("mt-4 font-bold tracking-tight text-ink", compact ? "text-xl" : "text-2xl")}>Set up your authenticator app</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Scan the code with Google Authenticator, 1Password, Authy or any app that supports one-time codes, then enter the 6-digit code it shows.
      </p>

      <div className={cx("mt-6 grid gap-5", compact ? "grid-cols-1" : "sm:grid-cols-[11rem_1fr]")}>
        <div className="mx-auto w-44 sm:mx-0">
          {setup ? <QrCode value={setup.otpauthUri} label="Authenticator setup QR code" className="w-full" /> : <Skeleton className="aspect-square w-full rounded-2xl" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-muted">Cannot scan? Enter this key by hand</p>
          {setup ? (
            <>
              <p className="mt-1.5 select-all break-all rounded-xl border border-line bg-surface px-3 py-2 font-mono text-sm font-semibold tracking-wider text-ink" data-testid="mfa-secret">
                {groupSecret(setup.secret)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyButton text={setup.secret} label="Copy key" />
                <Button type="button" variant="ghost" size="sm" icon={RefreshCw} loading={start.isPending} onClick={() => start.mutate()}>
                  New key
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-ink-faint">
                Time based, 6 digits, 30 seconds{account ? ` · account ${account}` : ""}. Verify a code before {new Date(setup.expiresAt).toLocaleTimeString()} or start again.
              </p>
            </>
          ) : (
            <Skeleton className="mt-1.5 h-10 w-full" />
          )}
        </div>
      </div>

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.length === 6 && !verify.isPending) verify.mutate(code);
        }}
      >
        <p className="mb-2 text-xs font-semibold text-ink-muted">Code from the app</p>
        <CodeInput value={code} onChange={setCode} onComplete={(value) => !verify.isPending && verify.mutate(value)} disabled={!setup || verify.isPending} error={Boolean(verify.error)} />
        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
            {errorMessage(error, "Could not confirm the code.")}
          </p>
        ) : null}
        <div className={cx("mt-5 flex gap-2", onCancel ? "justify-end" : "")}>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={verify.isPending}>
              Not now
            </Button>
          ) : null}
          <Button type="submit" size={onCancel ? "md" : "lg"} fullWidth={!onCancel} loading={verify.isPending} disabled={!setup || code.length < 6}>
            Turn on authenticator
          </Button>
        </div>
      </form>
    </div>
  );
}
