import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

import { BASE_URL } from "@/constant";
import {
  apiErrorDetails,
  isMfaSetupRequired,
  isSessionRevoked,
  isStepUpRequired,
  type StepUpDetails,
} from "@/lib/admin/auth-errors";
import { createRefreshQueue } from "@/lib/admin/refresh";
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
import type { AdminLoginResponseDto } from "./data-contracts";

/**
 * The one HTTP client for the admin. `Api` is generated from the backend's Swagger document
 * (`yarn generate-types`); this file is the only hand-written piece in the folder and owns the
 * session concerns:
 *
 * - the bearer token and the `X-Device-Id` header on every request;
 * - the 15-minute access token: a 401 refreshes the session once (one refresh shared by every
 *   request that failed together) and retries; a refresh that fails, or a 401 with
 *   `SESSION_REVOKED`, signs the person out with a reason the login page shows;
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

/**
 * Clears the cookies, then sends the person to sign in with a return path and the reason. The
 * cookies must go first: the middleware bounces anyone who still has one straight back to
 * /dashboard, and the next 401 would send them here again, forever.
 */
export function signOut(reason: "expired" | "revoked" | "signed-out") {
  clearSession();
  if (typeof window === "undefined" || redirecting) return;
  if (window.location.pathname.startsWith("/auth") || window.location.pathname.startsWith("/security/confirm")) return;
  redirecting = true;
  window.location.href = signOutUrl(reason, window.location.pathname + window.location.search);
}

const refreshQueue = createRefreshQueue<AdminLoginResponseDto>(async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");
  const result = await apiService.adminRefreshSession({ refreshToken });
  saveSession({ accessToken: result.accessToken, refreshToken: result.refreshToken });
  return result;
});

/** Refreshes the session now (one in flight at a time). Resolves to the new access token, or null when the session is gone. */
export async function refreshSession(): Promise<string | null> {
  const outcome = await refreshQueue.run();
  return outcome.ok ? (outcome.value.accessToken ?? null) : null;
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
      if (config._authRetried || !getRefreshToken()) {
        signOut("expired");
        return Promise.reject(error);
      }
      const outcome = await refreshQueue.run();
      if (!outcome.ok || !outcome.value.accessToken) {
        signOut(!outcome.ok && isSessionRevoked(outcome.error) ? "revoked" : "expired");
        return Promise.reject(error);
      }
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

    if (status === 428 && isStepUpRequired(error) && !config._stepUpRetried) {
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
