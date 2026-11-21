import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

import { BASE_URL } from "@/constant";
import {
  apiErrorDetails,
  isMfaSetupRequired,
  isSessionRevoked,
  isStepUpRequired,
  type StepUpDetails,
} from "@/lib/admin/auth-errors";
import {
  createCrossTabRefresh,
  createSessionChannel,
  createSessionKeeper,
  isDefinitiveRefreshFailure,
  REFRESH_LOCK_NAME,
  type RefreshedTokens,
  type SignOutReason,
  tokenExpiryMs,
  withCrossTabLock,
} from "@/lib/admin/refresh";
import {
  clearSession,
  getAccessToken,
  getDeviceId,
  getRefreshToken,
  saveSession,
  signOutUrl,
} from "@/lib/admin/session";
import { requestStepUp } from "@/lib/admin/step-up";
import { Api } from "./Api";

/**
 * The one HTTP client for the admin. `Api` is generated from the backend's Swagger document
 * (`yarn generate-types`); this file is the only hand-written piece in the folder and owns the
 * session concerns:
 *
 * - the bearer token and the `X-Device-Id` header on every request;
 * - the 15-minute access token: refreshed about a minute before it expires while the tab is
 *   visible (`startSessionKeeper`), and on a 401 (one refresh shared by every request that failed
 *   together, and by every tab: a Web Lock, then the cookies are re-read in case another tab
 *   already refreshed) followed by one retry;
 * - signing out only when the session is really over: the refresh route answered 401, there is no
 *   refresh token, or a request got 401 `SESSION_REVOKED`. A refresh that failed for any other
 *   reason (offline, a timeout, a 5xx, a 429, a 403) keeps the cookies, fails the request so the
 *   page shows its retry state, and tries the refresh again with backoff;
 * - tabs tell each other about refreshes and sign-outs on a BroadcastChannel;
 * - 428 `MFA_STEP_UP_REQUIRED`: asks for an authenticator code (the step-up dialog in the shell)
 *   and retries the same request once with `X-MFA-Code`;
 * - 403 `MFA_SETUP_REQUIRED`: the grace period ended, only the setup screen works now.
 */
type SecurityDataType = { token?: string };

type RetryConfig = InternalAxiosRequestConfig & { _authRetried?: boolean; _stepUpRetried?: boolean };

export const DEVICE_ID_HEADER = "X-Device-Id";
export const MFA_CODE_HEADER = "X-MFA-Code";
/** Where a session that must finish MFA setup is sent. */
export const MFA_SETUP_PATH = "/security/setup";

/** Sign-in routes answer 401 for their own reasons (a wrong code, an expired mfaToken); never refresh for them. */
const PUBLIC_AUTH_PATHS = [
  "/auth/admins/login",
  "/auth/admins/mfa/challenge",
  "/auth/admins/refresh",
  "/auth/admins/security/confirm",
];

export function isPublicAuthUrl(url: string | undefined) {
  return Boolean(url && PUBLIC_AUTH_PATHS.some((path) => url.includes(path)));
}

const apiService = new Api<SecurityDataType>({
  baseURL: BASE_URL,
  timeout: 45_000,
  timeoutErrorMessage: "Network error",
  securityWorker: async (securityData) => {
    const token = securityData?.token ?? getAccessToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  },
});

function setHeader(config: AxiosRequestConfig, name: string, value: string) {
  const headers = (config.headers ?? {}) as Record<string, unknown> & { set?: (key: string, value: string) => void };
  if (typeof headers.set === "function") headers.set(name, value);
  else headers[name] = value;
  config.headers = headers as InternalAxiosRequestConfig["headers"];
}

apiService.instance.interceptors.request.use((config) => {
  const deviceId = getDeviceId();
  if (deviceId) setHeader(config, DEVICE_ID_HEADER, deviceId);
  return config;
});

let redirecting = false;

/** Test helper: a redirect normally unloads the page, so the guard never needs resetting in the app. */
export function resetSessionGuardForTests() {
  redirecting = false;
}

const channel = createSessionChannel();
const refreshListeners = new Set<() => void>();

/** Called after any tab refreshed the session (the live socket reconnects if it was turned away). */
export function onSessionRefreshed(listener: () => void) {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

function notifyRefreshed() {
  refreshListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // A listener's problem is not the session's.
    }
  });
}

/**
 * Clears the cookies, then sends the person to sign in with a return path and the reason. The
 * cookies must go first: the middleware bounces anyone who still has one straight back to
 * /dashboard, and the next 401 would send them here again, forever. Every other tab is told too.
 */
export function signOut(reason: SignOutReason, options: { broadcast?: boolean } = {}) {
  clearSession();
  keeper.stop();
  if (options.broadcast !== false) channel.post({ type: "signed-out", reason });
  if (typeof window === "undefined" || redirecting) return;
  if (window.location.pathname.startsWith("/auth") || window.location.pathname.startsWith("/security/confirm")) return;
  redirecting = true;
  window.location.href = signOutUrl(reason, window.location.pathname + window.location.search);
}

/** The person signed out on purpose in this tab: the other tabs follow. */
export function announceSignedOut() {
  keeper.stop();
  channel.post({ type: "signed-out", reason: "signed-out" });
}

const refreshQueue = createCrossTabRefresh({
  readAccessToken: getAccessToken,
  readRefreshToken: getRefreshToken,
  callRefresh: (refreshToken) => apiService.adminRefreshSession({ refreshToken }),
  // A grace-window answer has no refreshToken: saveSession keeps the cookie that is there.
  save: (tokens) => saveSession(tokens),
  lock: (fn) => withCrossTabLock(REFRESH_LOCK_NAME, fn),
  onRefreshed: () => channel.post({ type: "refreshed" }),
});

/** What a failed refresh means: sign out only when it is final, else keep the session and retry soon. */
function handleRefreshFailure(error: unknown) {
  if (isDefinitiveRefreshFailure(error)) {
    signOut(isSessionRevoked(error) ? "revoked" : "expired");
    return;
  }
  keeper.retrySoon();
}

async function runRefresh() {
  const outcome = await refreshQueue.run();
  if (outcome.ok) {
    keeper.reschedule();
    notifyRefreshed();
  } else handleRefreshFailure(outcome.error);
  return outcome;
}

const keeper = createSessionKeeper({
  readAccessToken: getAccessToken,
  readRefreshToken: getRefreshToken,
  refresh: async () => {
    const outcome = await runRefresh();
    return outcome.ok ? { ok: true } : { ok: false, definitive: isDefinitiveRefreshFailure(outcome.error) };
  },
});

let keeperStarted = false;

/**
 * Keeps the session fresh while the console is open (mounted once by the dashboard shell):
 * refreshes ahead of expiry, rechecks when the tab comes back, and follows the other tabs.
 * Returns the stop function.
 */
export function startSessionKeeper() {
  if (typeof window === "undefined" || keeperStarted) return () => undefined;
  keeperStarted = true;
  keeper.start();
  const onVisibility = () => {
    if (document.visibilityState !== "hidden") keeper.onVisible();
  };
  document.addEventListener("visibilitychange", onVisibility);
  const unsubscribe = channel.subscribe((message) => {
    if (message.type === "refreshed") {
      keeper.reschedule();
      notifyRefreshed();
    } else signOut(message.reason, { broadcast: false });
  });
  return () => {
    keeperStarted = false;
    keeper.stop();
    document.removeEventListener("visibilitychange", onVisibility);
    unsubscribe();
  };
}

/** Refreshes the session now (shared across requests and tabs). Resolves to the new access token, or null when it failed. */
export async function refreshSession(): Promise<string | null> {
  const outcome = await runRefresh();
  return outcome.ok ? outcome.value.accessToken : null;
}

export type { RefreshedTokens };

function bearerOf(config: AxiosRequestConfig): string | undefined {
  const headers = (config.headers ?? {}) as Record<string, unknown> & { get?: (key: string) => unknown };
  const raw = typeof headers.get === "function" ? headers.get("Authorization") : headers.Authorization;
  return typeof raw === "string" && raw.startsWith("Bearer ") ? raw.slice(7) : undefined;
}

export type StepUpCancelledError = AxiosError & { stepUpCancelled: true };

export function isStepUpCancelled(error: unknown): error is StepUpCancelledError {
  return Boolean(error && typeof error === "object" && (error as StepUpCancelledError).stepUpCancelled);
}

apiService.instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    if (!config || !status) return Promise.reject(error);

    if (status === 401) {
      // A dead token on a sign-in route is the route's own answer (wrong code, expired mfaToken).
      if (isPublicAuthUrl(config.url)) return Promise.reject(error);
      if (isSessionRevoked(error)) {
        signOut("revoked");
        return Promise.reject(error);
      }
      // Already retried with a fresh token: this 401 is about the request, not the session.
      if (config._authRetried) return Promise.reject(error);
      if (!getRefreshToken()) {
        signOut("expired");
        return Promise.reject(error);
      }

      // Another tab (or an earlier request here) refreshed after this request went out: just retry.
      const current = getAccessToken();
      const exp = tokenExpiryMs(current);
      if (current && current !== bearerOf(config) && (exp === null || exp > Date.now() + 5_000)) {
        config._authRetried = true;
        setHeader(config, "Authorization", `Bearer ${current}`);
        return apiService.instance.request(config);
      }

      const outcome = await runRefresh();
      // A final failure already signed out; any other leaves the session for the retry with backoff.
      if (!outcome.ok) return Promise.reject(error);
      config._authRetried = true;
      setHeader(config, "Authorization", `Bearer ${outcome.value.accessToken}`);
      return apiService.instance.request(config);
    }

    if (status === 403 && isMfaSetupRequired(error)) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith(MFA_SETUP_PATH) && !redirecting) {
        redirecting = true;
        window.location.href = `${MFA_SETUP_PATH}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
      return Promise.reject(error);
    }

    // The sign-in and refresh routes never take a step-up code; asking for one there would hang the refresh.
    if (status === 428 && isStepUpRequired(error) && !config._stepUpRetried && !isPublicAuthUrl(config.url)) {
      const details = apiErrorDetails<StepUpDetails>(error) ?? { mfaEnabled: true };
      const code = await requestStepUp(details);
      if (!code) {
        (error as StepUpCancelledError).stepUpCancelled = true;
        return Promise.reject(error);
      }
      config._stepUpRetried = true;
      setHeader(config, details.header || MFA_CODE_HEADER, code);
      return apiService.instance.request(config);
    }

    // Lockouts (429) and role problems (403) stay on the page and surface through errorMessage().
    return Promise.reject(error);
  },
);

export { apiService };

export * from "./ApiRoute";
export * from "./data-contracts";
