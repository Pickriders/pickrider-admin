"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/components/layouts/AuthShell";
import { MfaSetupFlow } from "@/components/security/mfa-setup";
import { useAuth } from "@/hooks/useAuth";

/**
 * The setup-only screen. A session whose MFA grace period ended can only call the MFA routes
 * (403 MFA_SETUP_REQUIRED everywhere else), so the API client sends it here; the login flow also
 * lands here when sign-in says `mfaSetupRestricted`. Once the authenticator is on, the person
 * continues to where they were going.
 */
function SetupScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { logout } = useAuth();
  const next = params.get("next");
  const destination =
    next && next.startsWith("/") && !next.startsWith("/auth") && !next.startsWith("/security") ? next : "/dashboard";

  return (
    <AuthCard>
      <p className="mb-4 rounded-xl bg-warning-soft px-3 py-2 text-sm font-semibold text-warning">
        Two-step sign-in is now required for your role. Set up your authenticator app to keep using the console.
      </p>
      <MfaSetupFlow onDone={() => router.replace(destination)} />
      <button
        type="button"
        onClick={() => void logout()}
        className="mt-6 block w-full text-center text-sm font-semibold text-ink-muted hover:text-ink hover:underline"
      >
        Sign out instead
      </button>
    </AuthCard>
  );
}

export default function MfaSetupPage() {
  return (
    <div className="mx-auto w-full max-w-[35rem]">
      <Suspense>
        <SetupScreen />
      </Suspense>
    </div>
  );
}
