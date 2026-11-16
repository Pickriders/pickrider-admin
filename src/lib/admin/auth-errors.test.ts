import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { isLoginLocked, isSessionRevoked, isStepUpRequired, lockoutSecondsLeft, loginErrorMessage, mfaErrorMessage, waitLabel } from "./auth-errors";

function apiError(status: number, body: Record<string, unknown>) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError("Request failed", String(status), config, {}, { status, statusText: "", headers: {}, config, data: body });
}

describe("auth error copy", () => {
  it("says the same thing for an unknown email, a wrong password and a non-staff account", () => {
    expect(loginErrorMessage(apiError(400, { message: "Wrong email or password", code: "BAD_REQUEST" }))).toBe("Wrong email or password.");
    expect(loginErrorMessage(apiError(401, { message: "Unauthorized" }))).toBe("Wrong email or password.");
  });

  it("shows the server's wait on a lockout, whether it came as 429 or 423", () => {
    const now = Date.now();
    const locked = apiError(429, { code: "LOGIN_LOCKED", details: { retryAfterSeconds: 120, lockedUntil: new Date(now + 120_000).toISOString() } });
    expect(isLoginLocked(locked)).toBe(true);
    expect(loginErrorMessage(locked)).toMatch(/^Too many attempts\. Try again in 2 minutes\.$/);
    const legacy = apiError(423, { code: "LOGIN_LOCKED", details: { retryAfterSeconds: 45 } });
    expect(loginErrorMessage(legacy)).toBe("Too many attempts. Try again in 45 seconds.");
  });

  it("points a secured account to the password reset", () => {
    const secured = apiError(403, { code: "RESTRICTED", details: { passwordResetRequired: true } });
    expect(loginErrorMessage(secured)).toMatch(/Reset your password/);
    expect(loginErrorMessage(apiError(403, { code: "NOT_ALLOWED" }))).toMatch(/cannot sign in right now/);
  });

  it("recognises the session and step-up codes", () => {
    expect(isSessionRevoked(apiError(401, { code: "SESSION_REVOKED" }))).toBe(true);
    expect(isSessionRevoked(apiError(401, { code: "UNAUTHORIZED" }))).toBe(false);
    expect(isStepUpRequired(apiError(428, { code: "MFA_STEP_UP_REQUIRED", details: { mfaEnabled: true, header: "X-MFA-Code" } }))).toBe(true);
    expect(isStepUpRequired(apiError(400, { code: "MFA_CODE_INVALID" }))).toBe(false);
  });

  it("explains a wrong or expired MFA code", () => {
    expect(mfaErrorMessage(apiError(400, { code: "MFA_CODE_INVALID" }))).toMatch(/did not work/);
    expect(mfaErrorMessage(apiError(401, { code: "UNAUTHORIZED", message: "mfaToken expired" }))).toMatch(/expired/);
  });

  it("formats waits and lockout countdowns", () => {
    expect(waitLabel(5)).toBe("5 seconds");
    expect(waitLabel(60)).toBe("1 minute");
    expect(waitLabel(3900)).toBe("1 hour 5 minutes");
    expect(lockoutSecondsLeft({ retryAfterSeconds: 30 })).toBe(30);
    expect(lockoutSecondsLeft({ lockedUntil: new Date(Date.now() - 1000).toISOString() })).toBe(0);
    expect(lockoutSecondsLeft(undefined)).toBe(0);
  });
});
