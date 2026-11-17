import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { auth } from "@/lib/admin/api";
import { clearSession, saveSession, type SessionTokens } from "@/lib/admin/session";
import { MFA_SETUP_PATH } from "@/services";

export const useAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  /** Where a successful sign-in lands: the page the person was on, or the dashboard. */
  const destination = () =>
    redirect && redirect.startsWith("/") && !redirect.startsWith("/auth") ? redirect : "/dashboard";

  /**
   * Stores the tokens from a sign-in or MFA challenge and moves on. A session the core restricted
   * to MFA setup (the grace period ended) goes to the setup-only screen first.
   */
  const login = (
    tokens: SessionTokens & { mfaSetupRestricted?: boolean },
    rememberMe?: boolean,
    options: { quiet?: boolean } = {},
  ) => {
    saveSession(tokens, rememberMe);
    const next = destination();
    if (tokens.mfaSetupRestricted) {
      router.push(`${MFA_SETUP_PATH}?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!options.quiet) toast.success("Login successful", { description: "Welcome back to Pickriders Admin." });
    router.push(next);
  };

  /** Ends the session on the server too (best effort), then clears the cookies. */
  const logout = async () => {
    try {
      await auth.logout();
    } catch {
      // The cookies go either way; a dead session cannot be signed out twice.
    }
    clearSession();
    router.push("/auth/login?reason=signed-out");
  };

  return { login, logout, destination };
};
