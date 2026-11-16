"use client";

import { useFormik } from "formik";
import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";

import { useLoginMn, useMfaChallengeMn } from "@/api";
import { CodeInput } from "@/components/kit/code-input";
import { AuthCard } from "@/components/layouts/AuthShell";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import type { LoginResult } from "@/lib/admin/api";
import { apiErrorBody, apiErrorStatus, isLoginLocked, lockoutSecondsLeft, loginErrorMessage, mfaErrorMessage, waitLabel, type LockoutDetails } from "@/lib/admin/auth-errors";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

const FIELD_CLASS =
  "h-12 rounded-xl px-4 pl-11 text-[15px] font-semibold text-foreground bg-background placeholder:font-medium placeholder:text-muted-foreground";

/** Why the person is back at sign-in, set by the API client or the logout. */
const REASONS: Record<string, { tone: "warning" | "danger" | "neutral"; text: string }> = {
  expired: { tone: "warning", text: "Your session ended. Sign in again to pick up where you left off." },
  revoked: { tone: "danger", text: "This session was signed out, from another device or by a security action. Sign in again to continue." },
  "signed-out": { tone: "neutral", text: "You have been signed out." },
  secured: { tone: "warning", text: "Your account was secured. Sign in with your new password." },
};

/** A lockout counting down from the server's wait, so the copy stays truthful as the seconds pass. */
function useLockoutCountdown(error: unknown) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!isLoginLocked(error)) {
      setLeft(0);
      return;
    }
    const details = apiErrorBody(error)?.details as LockoutDetails | undefined;
    const until = Date.now() + lockoutSecondsLeft(details) * 1000;
    const tick = () => setLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [error]);
  return left;
}

type Stage = { kind: "password" } | { kind: "mfa"; mfaToken: string; expiresAt: number };

export const LoginForm = () => {
  const params = useSearchParams();
  const reason = REASONS[params.get("reason") ?? ""];
  const { login } = useAuth();
  const [stage, setStage] = useState<Stage>({ kind: "password" });
  const [rememberMe, setRememberMe] = useState(false);

  const onTokens = (result: LoginResult) => {
    if (result.mfaRequired && result.mfaToken) {
      setStage({ kind: "mfa", mfaToken: result.mfaToken, expiresAt: Date.now() + (result.mfaExpiresInSeconds ?? 300) * 1000 });
      return;
    }
    login(result, rememberMe, { quiet: Boolean(result.mfaSetupRestricted) });
  };

  if (stage.kind === "mfa") {
    return (
      <MfaChallenge
        mfaToken={stage.mfaToken}
        expiresAt={stage.expiresAt}
        onTokens={onTokens}
        onRestart={() => setStage({ kind: "password" })}
      />
    );
  }
  return <PasswordStep reason={reason} rememberMe={rememberMe} onRememberMe={setRememberMe} onTokens={onTokens} />;
};

function PasswordStep({
  reason,
  rememberMe,
  onRememberMe,
  onTokens,
}: {
  reason?: { tone: "warning" | "danger" | "neutral"; text: string };
  rememberMe: boolean;
  onRememberMe: (next: boolean) => void;
  onTokens: (result: LoginResult) => void;
}) {
  const loginMutation = useLoginMn({ onSuccess: onTokens });
  const lockoutLeft = useLockoutCountdown(loginMutation.error);
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: (values) => {
      // Core matches admin emails exactly as saved, so only trim here (no lowercasing).
      loginMutation.mutate({ password: values.password, identifier: values.email.trim() });
    },
  });

  const error = loginMutation.error;
  const locked = isLoginLocked(error) && lockoutLeft > 0;
  const passwordResetRequired = Boolean((apiErrorBody(error)?.details as { passwordResetRequired?: boolean } | undefined)?.passwordResetRequired);
  const errorText = error ? (locked ? `Too many attempts. Try again in ${waitLabel(lockoutLeft)}.` : loginErrorMessage(error)) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <AuthCard>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
          <ShieldCheck size={13} />
          Pickriders Admin
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]">Welcome back</h1>
        <p className="mt-2 text-[15px] font-medium text-muted-foreground">Sign in to manage orders, couriers, businesses and finances.</p>
        {reason ? (
          <p
            role="status"
            className={
              reason.tone === "danger"
                ? "mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm font-semibold text-danger"
                : reason.tone === "warning"
                  ? "mt-3 rounded-xl bg-warning-soft px-3 py-2 text-sm font-semibold text-warning"
                  : "mt-3 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-foreground"
            }
          >
            {reason.text}
          </p>
        ) : null}

        <form onSubmit={formik.handleSubmit} className="mt-8" autoComplete="off">
          <div className="space-y-5">
            <UI.Input
              labelValue="Email address"
              labelClassName="text-sm font-bold text-foreground"
              id="email"
              type="email"
              placeholder="you@pickriders.com"
              leftIcon={<SVG.Mail />}
              className={FIELD_CLASS}
              {...formik.getFieldProps("email")}
              errorMessage={formik.touched.email && formik.errors.email}
            />
            <UI.Input
              labelValue="Password"
              labelClassName="text-sm font-bold text-foreground"
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="off"
              leftIcon={<SVG.LockIcon />}
              showToggle
              className={`${FIELD_CLASS} pr-12`}
              errorMessage={formik.touched.password && formik.errors.password}
              {...formik.getFieldProps("password")}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <UI.Checkbox checked={rememberMe} onCheckedChange={(val) => onRememberMe(Boolean(val))} />
                <span className="text-sm font-semibold text-foreground">Remember me</span>
              </label>
              <Link href={"/auth/reset-password"} className="text-sm font-bold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {errorText ? (
            <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger">
              {errorText}
              {passwordResetRequired ? (
                <Link href="/auth/reset-password" className="mt-1 block font-bold underline">
                  Reset your password
                </Link>
              ) : null}
            </div>
          ) : null}

          {/* `loading` keeps the label in place under an overlaid spinner, so the button never resizes. */}
          <UI.PrimaryButton
            type="submit"
            loading={loginMutation.isPending}
            loadingText="Signing in"
            disabled={locked}
            className="mt-6 h-12 rounded-xl text-[15px] font-bold"
          >
            {locked ? `Locked for ${waitLabel(lockoutLeft)}` : "Sign in"}
          </UI.PrimaryButton>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ShieldCheck size={13} />
          Protected area. Authorized staff only.
        </p>
      </AuthCard>
    </motion.div>
  );
}

/** Step two: the six-digit authenticator code, or a recovery code, against the single-use mfaToken. */
export function MfaChallenge({
  mfaToken,
  expiresAt,
  onTokens,
  onRestart,
}: {
  mfaToken: string;
  expiresAt: number;
  onTokens: (result: LoginResult) => void;
  onRestart: () => void;
}) {
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [expired, setExpired] = useState(false);
  const challenge = useMfaChallengeMn({ onSuccess: onTokens });
  const lockoutLeft = useLockoutCountdown(challenge.error);

  useEffect(() => {
    const timer = window.setInterval(() => setExpired(Date.now() >= expiresAt), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const submit = (value?: string) => {
    if (challenge.isPending || expired) return;
    const body = useRecovery ? { recoveryCode: recovery.trim().toUpperCase() } : { code: value ?? code };
    if (useRecovery ? !body.recoveryCode : (body.code?.length ?? 0) < 6) return;
    challenge.mutate({ mfaToken, trustDevice, ...body });
  };

  const error = challenge.error;
  const locked = isLoginLocked(error) && lockoutLeft > 0;
  const errorText = expired
    ? "This sign-in attempt expired. Start again from your password."
    : error
      ? locked
        ? `Too many attempts. Try again in ${waitLabel(lockoutLeft)}.`
        : mfaErrorMessage(error)
      : null;
  // A dead mfaToken (401 from the challenge) means starting over, not another code.
  const mustRestart = expired || apiErrorStatus(error) === 401;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <AuthCard>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
          {useRecovery ? <KeyRound size={22} /> : <Smartphone size={22} />}
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          {useRecovery ? "Use a recovery code" : "Check your authenticator app"}
        </h1>
        <p className="mt-2 text-[15px] font-medium text-muted-foreground">
          {useRecovery
            ? "Enter one of the recovery codes you saved when you set up your authenticator. Each code works once."
            : "Enter the 6-digit code your authenticator app shows for Pickriders Admin."}
        </p>

        <form
          className="mt-7"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {useRecovery ? (
            <UI.Input
              labelValue="Recovery code"
              labelClassName="text-sm font-bold text-foreground"
              id="recoveryCode"
              placeholder="XXXXX-XXXXX"
              autoComplete="off"
              autoFocus
              value={recovery}
              onChange={(event) => setRecovery(event.target.value)}
              className="h-12 rounded-xl px-4 font-mono text-[15px] font-semibold uppercase tracking-widest text-foreground bg-background"
            />
          ) : (
            <CodeInput value={code} onChange={setCode} onComplete={(value) => submit(value)} autoFocus disabled={challenge.isPending || mustRestart} error={Boolean(error) && !locked} />
          )}

          <label className="mt-5 flex cursor-pointer items-start gap-2">
            <UI.Checkbox checked={trustDevice} onCheckedChange={(val) => setTrustDevice(Boolean(val))} className="mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-foreground">Remember this device for 30 days</span>
              <span className="block text-xs text-muted-foreground">Skip the code on this browser. Do not use on a shared computer.</span>
            </span>
          </label>

          {errorText ? (
            <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger">
              {errorText}
            </div>
          ) : null}

          {mustRestart ? (
            <UI.PrimaryButton type="button" onClick={onRestart} className="mt-6 h-12 rounded-xl text-[15px] font-bold">
              Back to sign in
            </UI.PrimaryButton>
          ) : (
            <UI.PrimaryButton
              type="submit"
              loading={challenge.isPending}
              loadingText="Checking"
              disabled={locked || (useRecovery ? !recovery.trim() : code.length < 6)}
              className="mt-6 h-12 rounded-xl text-[15px] font-bold"
            >
              {locked ? `Locked for ${waitLabel(lockoutLeft)}` : "Continue"}
            </UI.PrimaryButton>
          )}
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setUseRecovery((v) => !v);
              challenge.reset();
            }}
            className="text-primary hover:underline"
          >
            {useRecovery ? "Use my authenticator app instead" : "Use a recovery code"}
          </button>
          <button type="button" onClick={onRestart} className="text-muted-foreground hover:text-foreground hover:underline">
            Sign in as someone else
          </button>
        </div>
      </AuthCard>
    </motion.div>
  );
}
