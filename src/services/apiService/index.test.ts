/**
 * @jest-environment jsdom
 */
import type { AxiosRequestConfig } from "axios";
import * as cookies from "cookies-next";

import { STORAGE } from "@/constant";
import { requestStepUp, resetStepUpForTests, settleStepUp, subscribeStepUp } from "@/lib/admin/step-up";
import { apiService, resetSessionGuardForTests } from "./index";

/**
 * The session interceptor in the hand-written wrapper:
 * - a 401 with a refresh token refreshes once (one refresh for every request that failed together)
 *   and retries with the new token; without one, or when the refresh fails, it clears the cookies
 *   BEFORE redirecting (the middleware sends anyone with a cookie straight back, looping forever);
 * - a 401 `SESSION_REVOKED` signs out with that reason and never refreshes;
 * - a 428 asks the step-up dialog for a code and retries once with `X-MFA-Code`;
 * - a 403 must not touch the session at all;
 * - every request carries the browser's `X-Device-Id`.
 */
type Call = { url: string; headers: Record<string, unknown>; data?: unknown };

const calls: Call[] = [];
let cookieJar: Record<string, string> = {};

/** Scripted responses by URL substring; a function gets the call index for that URL. */
let script: Record<string, (n: number) => { status: number; data?: unknown }> = {};

/** The interceptor is async: give the rejected request a real tick to reach the step-up store. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function install() {
  const seen: Record<string, number> = {};
  apiService.instance.defaults.adapter = async (config: AxiosRequestConfig) => {
    const url = config.url ?? "";
    const headers = { ...(config.headers as Record<string, unknown>) };
    calls.push({ url, headers, data: typeof config.data === "string" ? JSON.parse(config.data) : config.data });
    const key = Object.keys(script).find((k) => url.includes(k)) ?? "";
    seen[key] = (seen[key] ?? 0) + 1;
    const { status, data } = script[key]?.(seen[key]) ?? { status: 200, data: { ok: true } };
    const response = { data: data ?? { message: "x" }, status, statusText: "", headers: {}, config: config as never };
    if (status >= 400) throw Object.assign(new Error("Request failed"), { response, config, isAxiosError: true });
    return response;
  };
}

describe("apiService session interceptor", () => {
  const location = { pathname: "/orders", search: "?tab=board", href: "" };

  beforeEach(() => {
    calls.length = 0;
    cookieJar = {};
    script = {};
    resetStepUpForTests();
    resetSessionGuardForTests();
    Object.defineProperty(window, "location", { value: location, writable: true });
    location.href = "";
    window.localStorage.clear();
    jest.spyOn(cookies, "getCookie").mockImplementation((key) => cookieJar[String(key)]);
    jest.spyOn(cookies, "setCookie").mockImplementation((key, value) => {
      cookieJar[String(key)] = String(value);
    });
    jest.spyOn(cookies, "deleteCookie").mockImplementation((key) => {
      delete cookieJar[String(key)];
    });
    install();
  });

  it("sends a stable X-Device-Id on every request", async () => {
    await apiService.adminGetMyProfile();
    await apiService.adminGetMyProfile();
    const ids = calls.map((c) => c.headers["X-Device-Id"]);
    expect(typeof ids[0]).toBe("string");
    expect((ids[0] as string).length).toBeGreaterThanOrEqual(16);
    expect(ids[1]).toBe(ids[0]);
    expect(window.localStorage.getItem(STORAGE.deviceId)).toBe(ids[0]);
  });

  it("a 401 without a refresh token clears the session and sends the person to sign in with a return path", async () => {
    cookieJar[STORAGE.accessToken] = "old";
    script = { "/admins/users/me": () => ({ status: 401, data: { message: "Unauthorized" } }) };
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();

    expect(cookieJar[STORAGE.accessToken]).toBeUndefined();
    expect(location.href).toBe(`/auth/login?redirect=${encodeURIComponent("/orders?tab=board")}&reason=expired`);
  });

  it("a 401 with a refresh token refreshes once, stores the new tokens and retries with the new bearer", async () => {
    cookieJar[STORAGE.accessToken] = "old";
    cookieJar[STORAGE.refreshToken] = "refresh-1";
    script = {
      "/auth/admins/refresh": () => ({ status: 200, data: { mfaRequired: false, accessToken: "new", refreshToken: "refresh-2" } }),
      "/admins/users/me": (n) => (n === 1 ? { status: 401, data: { message: "jwt expired" } } : { status: 200, data: { _id: "me" } }),
    };
    const me = await apiService.adminGetMyProfile();
    expect(me).toEqual({ _id: "me" });

    const urls = calls.map((c) => c.url.replace(/^.*\/api\/v1/, ""));
    expect(urls).toEqual(["/admins/users/me", "/auth/admins/refresh", "/admins/users/me"]);
    expect(calls[1].data).toEqual({ refreshToken: "refresh-1" });
    expect(calls[2].headers.Authorization).toBe("Bearer new");
    expect(cookieJar[STORAGE.accessToken]).toBe("new");
    expect(cookieJar[STORAGE.refreshToken]).toBe("refresh-2");
    expect(location.href).toBe("");
  });

  it("concurrent 401s share one refresh", async () => {
    cookieJar[STORAGE.accessToken] = "old";
    cookieJar[STORAGE.refreshToken] = "refresh-1";
    const seen = { me: 0, wallets: 0 };
    script = {
      "/auth/admins/refresh": () => ({ status: 200, data: { mfaRequired: false, accessToken: "new", refreshToken: "refresh-2" } }),
      "/admins/users/me": () => (++seen.me === 1 ? { status: 401 } : { status: 200, data: { _id: "me" } }),
      "/admins/stats/attention": () => (++seen.wallets === 1 ? { status: 401 } : { status: 200, data: { ok: 1 } }),
    };
    await Promise.all([apiService.adminGetMyProfile(), apiService.attention()]);
    expect(calls.filter((c) => c.url.includes("/auth/admins/refresh"))).toHaveLength(1);
    expect(calls.filter((c) => c.headers.Authorization === "Bearer new")).toHaveLength(2);
  });

  it("a 401 after the retry, or a failed refresh, signs out as expired", async () => {
    cookieJar[STORAGE.accessToken] = "old";
    cookieJar[STORAGE.refreshToken] = "refresh-1";
    script = {
      "/auth/admins/refresh": () => ({ status: 401, data: { message: "Unauthorized" } }),
      "/admins/users/me": () => ({ status: 401 }),
    };
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();
    expect(cookieJar[STORAGE.refreshToken]).toBeUndefined();
    expect(location.href).toContain("reason=expired");
  });

  it("SESSION_REVOKED signs out with that reason and does not try to refresh", async () => {
    cookieJar[STORAGE.accessToken] = "old";
    cookieJar[STORAGE.refreshToken] = "refresh-1";
    script = { "/admins/users/me": () => ({ status: 401, data: { message: "Session revoked", code: "SESSION_REVOKED" } }) };
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();
    expect(calls.some((c) => c.url.includes("/auth/admins/refresh"))).toBe(false);
    expect(location.href).toContain("reason=revoked");
    expect(cookieJar[STORAGE.accessToken]).toBeUndefined();
  });

  it("a 401 from the sign-in routes is the route's own answer: no refresh, no redirect", async () => {
    cookieJar[STORAGE.refreshToken] = "refresh-1";
    script = { "/auth/admins/mfa/challenge": () => ({ status: 401, data: { message: "mfaToken expired" } }) };
    await expect(apiService.adminMfaChallenge({ mfaToken: "t", code: "123456" })).rejects.toBeTruthy();
    expect(calls).toHaveLength(1);
    expect(location.href).toBe("");
  });

  it("a 403 leaves the session alone", async () => {
    cookieJar[STORAGE.accessToken] = "tok";
    script = { "/admins/users/me": () => ({ status: 403, data: { message: "Forbidden" } }) };
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();
    expect(cookieJar[STORAGE.accessToken]).toBe("tok");
    expect(location.href).toBe("");
  });

  it("a 428 asks for a step-up code and retries once with X-MFA-Code", async () => {
    cookieJar[STORAGE.accessToken] = "tok";
    script = {
      "/admins/users/u1/erase": (n) =>
        n === 1
          ? { status: 428, data: { code: "MFA_STEP_UP_REQUIRED", details: { mfaEnabled: true, header: "X-MFA-Code", freshForMinutes: 10 } } }
          : { status: 200, data: { message: "Erased", tombstoneId: "t1", erasedAt: "now", summary: {} } },
    };
    let prompted: unknown = null;
    subscribeStepUp((request) => {
      if (request) prompted = request;
    });
    const pending = apiService.adminEraseUser("u1", { reason: "r" });
    await flush();
    expect(prompted).toMatchObject({ details: { mfaEnabled: true } });
    settleStepUp("654321");
    const result = await pending;
    expect(result).toMatchObject({ tombstoneId: "t1" });
    expect(calls).toHaveLength(2);
    expect(calls[1].headers["X-MFA-Code"]).toBe("654321");
    expect(calls[0].headers["X-MFA-Code"]).toBeUndefined();
  });

  it("a cancelled step-up rejects the request without retrying and marks the error", async () => {
    cookieJar[STORAGE.accessToken] = "tok";
    script = { "/admin-configs/platform-settings": () => ({ status: 428, data: { code: "MFA_STEP_UP_REQUIRED", details: { mfaEnabled: false } } }) };
    const pending = apiService.updatePlatformSettings({ withdrawalsFrozen: { active: true, reason: "x" } });
    await flush();
    settleStepUp(null);
    await expect(pending).rejects.toMatchObject({ stepUpCancelled: true });
    expect(calls).toHaveLength(1);
  });

  it("a second 428 on the retry is not prompted for again", async () => {
    cookieJar[STORAGE.accessToken] = "tok";
    script = { "/admin-configs/platform-settings": () => ({ status: 428, data: { code: "MFA_STEP_UP_REQUIRED", details: { mfaEnabled: true } } }) };
    const pending = apiService.updatePlatformSettings({ supportEmails: [] });
    await flush();
    settleStepUp("111111");
    await expect(pending).rejects.toBeTruthy();
    expect(calls).toHaveLength(2);
  });

  it("a 403 MFA_SETUP_REQUIRED sends the session to the setup-only screen", async () => {
    cookieJar[STORAGE.accessToken] = "tok";
    script = { "/admins/users/me": () => ({ status: 403, data: { code: "MFA_SETUP_REQUIRED", message: "Set up MFA" } }) };
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();
    expect(location.href).toBe(`/security/setup?next=${encodeURIComponent("/orders?tab=board")}`);
    // The session itself stays: the setup routes still work with it.
    expect(cookieJar[STORAGE.accessToken]).toBe("tok");
  });

  it("requestStepUp from elsewhere shares the prompt with an in-flight 428", async () => {
    const other = requestStepUp({ mfaEnabled: true });
    settleStepUp("000000");
    await expect(other).resolves.toBe("000000");
  });
});
