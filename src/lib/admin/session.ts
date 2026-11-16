import { deleteCookie, getCookie, setCookie } from "cookies-next";

import { STORAGE } from "@/constant";

/**
 * The admin session as the browser keeps it. The core issues a 15-minute access JWT and a
 * rotating refresh token; both live in cookies (the middleware reads the access token to gate
 * pages, `apiService` reads both to call the API and refresh). "Remember me" decides whether
 * the cookies survive the browser closing. The device id lives in localStorage so it is the
 * same for every tab and every sign-in from this browser.
 */
export type SessionTokens = {
  accessToken?: string;
  refreshToken?: string;
  /** Seconds until the access token expires (informational; the API decides). */
  expiryDurationSeconds?: number;
  /** MFA is compulsory and not set up yet: the console shows the setup banner until this date. */
  mfaSetupRequired?: boolean;
  mfaSetupDeadline?: string;
  mfaEnabled?: boolean;
};

const THIRTY_DAYS = 30 * 24 * 60 * 60;

function cookieOptions(remember: boolean) {
  return {
    maxAge: remember ? THIRTY_DAYS : undefined,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}

/** Remembered per browser so a refresh keeps the policy the person chose at sign-in. */
const REMEMBER_KEY = "@pickriders/rememberMe";

function readRemember(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    return false;
  }
}

/** Stores a sign-in (or refresh) result. Tokens that are absent are left as they were. */
export function saveSession(tokens: SessionTokens, rememberMe?: boolean) {
  const remember = rememberMe ?? readRemember();
  try {
    if (rememberMe !== undefined && typeof window !== "undefined") {
      window.localStorage.setItem(REMEMBER_KEY, rememberMe ? "1" : "0");
    }
  } catch {
    // localStorage can be unavailable (private mode, blocked storage); the cookies still work.
  }
  const options = cookieOptions(remember);
  if (tokens.accessToken) setCookie(STORAGE.accessToken, tokens.accessToken, options);
  if (tokens.refreshToken) setCookie(STORAGE.refreshToken, tokens.refreshToken, options);
  if (tokens.mfaEnabled) clearMfaSetupDeadline();
  else if (tokens.mfaSetupRequired && tokens.mfaSetupDeadline) setMfaSetupDeadline(tokens.mfaSetupDeadline);
}

export function clearSession() {
  deleteCookie(STORAGE.accessToken, { path: "/" });
  deleteCookie(STORAGE.refreshToken, { path: "/" });
  clearMfaSetupDeadline();
}

export function getAccessToken(): string | undefined {
  const value = getCookie(STORAGE.accessToken);
  return value ? String(value) : undefined;
}

export function getRefreshToken(): string | undefined {
  const value = getCookie(STORAGE.refreshToken);
  return value ? String(value) : undefined;
}

function randomId() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * A stable random id for this browser, created on first use. Returns undefined where storage is
 * unavailable: the API then treats every sign-in as a new device and ignores "trust this device".
 */
export function getDeviceId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(STORAGE.deviceId);
    if (existing && /^[a-zA-Z0-9_-]{8,128}$/.test(existing)) return existing;
    const created = randomId();
    window.localStorage.setItem(STORAGE.deviceId, created);
    return created;
  } catch {
    return undefined;
  }
}

export function getMfaSetupDeadline(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE.mfaSetupDeadline);
  } catch {
    return null;
  }
}

export function setMfaSetupDeadline(deadline: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE.mfaSetupDeadline, deadline);
  } catch {
    // Without storage the banner simply does not show; the API still enforces the deadline.
  }
}

export function clearMfaSetupDeadline() {
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE.mfaSetupDeadline);
  } catch {
    // ignore
  }
}

/**
 * Where to send the person when the session is over. Clears the cookies first: the middleware
 * bounces anyone who still has an access-token cookie straight back to /dashboard, and the next
 * 401 would send them here again, forever.
 */
export function signOutUrl(reason: "expired" | "revoked" | "signed-out", back?: string) {
  const params = new URLSearchParams();
  if (back && !back.startsWith("/auth")) params.set("redirect", back);
  params.set("reason", reason);
  return `/auth/login?${params.toString()}`;
}
