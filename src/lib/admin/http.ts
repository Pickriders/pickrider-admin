import axios from "axios";

import { apiErrorBody, isLoginLocked, isStepUpRequired, lockoutSecondsLeft, waitLabel, type LockoutDetails } from "./auth-errors";

/**
 * Error copy for anything the generated client rejects with. The client itself lives in
 * `@/services` (`apiService`); the admin pages reach it through the typed namespaces in ./api.ts.
 */
export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || (!error.response && error.code === "ERR_NETWORK")) {
      return "The server took too long to respond. Check your connection and try again.";
    }
    const body = apiErrorBody(error);
    // The step-up dialog was dismissed: the request never went through, nothing changed.
    if ((error as { stepUpCancelled?: boolean }).stepUpCancelled) return "Verification cancelled. Nothing was changed.";
    if (isStepUpRequired(error)) return "This action needs a fresh authenticator code.";
    if (body?.code === "MFA_CODE_INVALID") return "That authenticator code did not work. Try again.";
    if (isLoginLocked(error)) {
      const left = lockoutSecondsLeft(body?.details as LockoutDetails | undefined);
      return left > 0 ? `Too many attempts. Try again in ${waitLabel(left)}.` : "Too many attempts. Try again shortly.";
    }
    if (error.response?.status === 403 && body?.code === "MFA_SETUP_REQUIRED") return "Set up your authenticator app to continue.";
    if (error.response?.status === 403 && body?.code !== "WITHDRAWALS_FROZEN" && body?.code !== "WITHDRAWAL_RESTRICTED") {
      return "Your role isn't allowed to do this. Ask a platform admin.";
    }
    const message = body?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
