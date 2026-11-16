"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LogOut, ShieldAlert, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/kit/primitives";
import { AuthCard } from "@/components/layouts/AuthShell";
import { auth } from "@/lib/admin/api";
import { apiErrorStatus } from "@/lib/admin/auth-errors";
import { errorMessage } from "@/lib/admin/http";

/**
 * Where the links in security emails land: "Yes, it was me" / "No, secure my account" from the
 * new-device email, and "Sign out this device" from the sign-in email. The API's GET redirect
 * brings the signed token and the action here; nothing happens until the button is pressed, so a
 * mail scanner opening the link cannot act on the account.
 */
type ActionKey = "TRUST_DEVICE" | "SECURE_ACCOUNT" | "REVOKE_SESSION";

const ACTIONS: Record<ActionKey, { icon: LucideIcon; tone: "brand" | "danger" | "warning"; title: string; body: string; button: string }> = {
  TRUST_DEVICE: {
    icon: Smartphone,
    tone: "brand",
    title: "Was this you?",
    body: "You are confirming the recent sign-in from a new device was yours. The device will be remembered and will not ask for a code for 30 days.",
    button: "Yes, it was me",
  },
  SECURE_ACCOUNT: {
    icon: ShieldAlert,
    tone: "danger",
    title: "Secure your account",
    body: "Every session will be signed out, remembered devices forgotten, and you will need to reset your password before signing in again.",
    button: "No, secure my account",
  },
  REVOKE_SESSION: {
    icon: LogOut,
    tone: "warning",
    title: "Sign out this device",
    body: "The session the email was about will be signed out. Other devices stay signed in.",
    button: "Sign out this device",
  },
};

const TONE_CHIP = { brand: "bg-brand-soft text-brand-dark", danger: "bg-danger-soft text-danger", warning: "bg-warning-soft text-warning" };

function ConfirmScreen() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const actionParam = (params.get("action") ?? "") as ActionKey;
  const action = ACTIONS[actionParam] ?? ACTIONS.REVOKE_SESSION;
  const confirm = useMutation({ mutationFn: () => auth.securityConfirm(token) });

  if (!token) {
    return (
      <AuthCard>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-warning-soft text-warning">
          <ShieldAlert size={22} />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">This link is incomplete</h1>
        <p className="mt-2 text-sm text-muted-foreground">Open the link from the email again, or sign in and manage your sessions from Settings, Security.</p>
        <Link href="/auth/login" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">
          Go to sign in
        </Link>
      </AuthCard>
    );
  }

  if (confirm.isSuccess) {
    const result = confirm.data;
    return (
      <AuthCard>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 size={22} />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Done</h1>
        <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
        {result.revokedSessions > 0 ? (
          <p className="mt-2 text-sm font-semibold text-foreground">
            {result.revokedSessions} session{result.revokedSessions === 1 ? "" : "s"} signed out.
          </p>
        ) : null}
        {result.passwordResetRequired ? (
          <div className="mt-6 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm">
            <p className="font-bold text-ink">Reset your password to sign in again</p>
            <p className="mt-0.5 text-ink-muted">Your old password no longer works. Use the reset flow to pick a new one.</p>
            <Link href="/auth/reset-password" className="mt-2 inline-block font-bold text-primary hover:underline">
              Reset my password
            </Link>
          </div>
        ) : (
          <Link href="/auth/login" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">
            Go to sign in
          </Link>
        )}
      </AuthCard>
    );
  }

  const status = apiErrorStatus(confirm.error);
  const errorText = confirm.error
    ? status === 400 || status === 401 || status === 404 || status === 410
      ? "This link has already been used or has expired. Links work once and for 24 hours."
      : errorMessage(confirm.error, "Could not confirm this action.")
    : null;

  return (
    <AuthCard>
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${TONE_CHIP[action.tone]}`}>
        <action.icon size={22} />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{action.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{action.body}</p>
      {errorText ? (
        <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger">
          {errorText}
        </p>
      ) : null}
      <Button
        type="button"
        size="lg"
        fullWidth
        variant={action.tone === "danger" ? "danger" : "primary"}
        className="mt-6"
        loading={confirm.isPending}
        disabled={Boolean(errorText)}
        onClick={() => confirm.mutate()}
      >
        {action.button}
      </Button>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ShieldCheck size={13} />
        Nothing happens until you press the button.
      </p>
    </AuthCard>
  );
}

export default function SecurityConfirmPage() {
  return (
    <div className="mx-auto w-full max-w-[35rem]">
      <Suspense>
        <ConfirmScreen />
      </Suspense>
    </div>
  );
}
