import axios from "axios";

/**
 * The error envelope the core's AllExceptionsFilter sends: `{ message, code, details? }`. The
 * codes below are the ones the admin console reacts to (see backend-api
 * `src/shared/interfaces/error.type.ts`); everything else surfaces as its message.
 */
export type ApiErrorCode =
  | "LOGIN_LOCKED"
  | "MFA_REQUIRED"
  | "MFA_SETUP_REQUIRED"
  | "MFA_STEP_UP_REQUIRED"
  | "MFA_CODE_INVALID"
  | "SESSION_REVOKED"
  | "WITHDRAWALS_FROZEN"
  | "ACCOUNT_PENDING_ERASURE"
  | "ERASURE_BLOCKED"
  | "ACCOUNT_ERASED"
  | "RESTRICTED"
  | "NOT_ALLOWED"
  | "UNVERIFIED"
  | "BAD_REQUEST"
  | (string & {});

export type ApiErrorBody = {
  message?: string | string[];
  code?: ApiErrorCode;
  details?: Record<string, unknown>;
  statusCode?: number;
};

export type StepUpDetails = {
  /** false: the admin has no authenticator yet and must set one up before this action. */
  mfaEnabled: boolean;
  /** The header the retry must carry, "X-MFA-Code". */
  header?: string;
  /** How long a verified code keeps the session fresh for step-up actions. */
  freshForMinutes?: number;
};

export type LockoutDetails = {
  retryAfterSeconds?: number;
  lockedUntil?: string;
};

export function apiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data;
  return data && typeof data === "object" ? (data as ApiErrorBody) : undefined;
}

export function apiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function apiErrorCode(error: unknown): ApiErrorCode | undefined {
  return apiErrorBody(error)?.code;
}

export function apiErrorDetails<T extends Record<string, unknown>>(error: unknown): T | undefined {
  const details = apiErrorBody(error)?.details;
  return details && typeof details === "object" ? (details as T) : undefined;
}

export const isSessionRevoked = (error: unknown) => apiErrorStatus(error) === 401 && apiErrorCode(error) === "SESSION_REVOKED";
export const isStepUpRequired = (error: unknown) => apiErrorStatus(error) === 428 || apiErrorCode(error) === "MFA_STEP_UP_REQUIRED";
export const isMfaSetupRequired = (error: unknown) => apiErrorStatus(error) === 403 && apiErrorCode(error) === "MFA_SETUP_REQUIRED";
/** The core answers a locked sign-in with 429 LOGIN_LOCKED (older builds used 423); the code is what matters. */
export const isLoginLocked = (error: unknown) => {
  const status = apiErrorStatus(error);
  return apiErrorCode(error) === "LOGIN_LOCKED" || status === 423;
};

/** "2 minutes", "45 seconds", "1 hour 5 minutes" for a wait the server asked for. */
export function waitLabel(seconds: number | undefined | null): string {
  const total = Math.max(0, Math.ceil(seconds ?? 0));
  if (total < 60) return `${total} second${total === 1 ? "" : "s"}`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.ceil((total % 3600) / 60);
  const parts: string[] = [];
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/** Seconds left on a lockout, from the server's retryAfterSeconds or lockedUntil. */
export function lockoutSecondsLeft(details: LockoutDetails | undefined, now = Date.now()): number {
  if (!details) return 0;
  if (details.lockedUntil) {
    const until = new Date(details.lockedUntil).getTime();
    if (!Number.isNaN(until)) return Math.max(0, Math.ceil((until - now) / 1000));
  }
  return Math.max(0, Math.ceil(details.retryAfterSeconds ?? 0));
}

export const WRONG_CREDENTIALS = "Wrong email or password.";
export const WRONG_CODE = "That code did not work. Check your authenticator app and try again.";

/**
 * One voice for every sign-in error. The core never says whether an email exists, and neither
 * do we: unknown emails, wrong passwords and non-staff accounts all read the same.
 */
export function loginErrorMessage(error: unknown): string {
  const status = apiErrorStatus(error);
  const body = apiErrorBody(error);
  if (isLoginLocked(error)) {
    const left = lockoutSecondsLeft(body?.details as LockoutDetails | undefined);
    return left > 0 ? `Too many attempts. Try again in ${waitLabel(left)}.` : "Too many attempts. Try again shortly.";
  }
  if (status === 429) return "Too many attempts from this connection. Wait a minute and try again.";
  if (status === 400 || status === 401) {
    if (body?.code === "MFA_CODE_INVALID") return WRONG_CODE;
    return WRONG_CREDENTIALS;
  }
  if (status === 403) {
    if (body?.details && (body.details as { passwordResetRequired?: boolean }).passwordResetRequired) {
      return "This account was secured after a sign-in you did not recognise. Reset your password to continue.";
    }
    if (body?.code === "UNVERIFIED") return "Verify your email address before signing in.";
    if (body?.code === "ACCOUNT_PENDING_ERASURE") return "This account is scheduled for erasure and cannot sign in.";
    return "This account cannot sign in right now. Ask a platform admin.";
  }
  if (axios.isAxiosError(error) && !error.response) return "Could not reach Pickriders. Check your connection and try again.";
  const message = body?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" && message ? message : "Something went wrong. Try again.";
}

/** Copy for a wrong authenticator or recovery code, with the lockout wait when there is one. */
export function mfaErrorMessage(error: unknown): string {
  if (isLoginLocked(error)) return loginErrorMessage(error);
  const status = apiErrorStatus(error);
  const code = apiErrorCode(error);
  if (status === 401 && code !== "MFA_CODE_INVALID") return "This sign-in attempt expired. Start again from your password.";
  if (status === 400 || status === 401 || code === "MFA_CODE_INVALID") return WRONG_CODE;
  return loginErrorMessage(error);
}
