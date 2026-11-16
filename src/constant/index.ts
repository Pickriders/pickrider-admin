export * from "./select";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const GOOGLE_MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

export const MAP_ID = process.env.NEXT_PUBLIC_MAP_ID;

export const API_URL = `${BASE_URL}/api/v1`;

export const STORAGE = {
  accessToken: "@pickriders/accessToken",
  /** Rotating refresh token for POST /auth/admins/refresh (cookie, same lifetime policy as the access token). */
  refreshToken: "@pickriders/refreshToken",
  /** Random id this browser sends as X-Device-Id so "remember this device" and new-device emails work (localStorage). */
  deviceId: "@pickriders/deviceId",
  /** ISO deadline for the authenticator grace banner, stored at sign-in while MFA setup is pending (localStorage). */
  mfaSetupDeadline: "@pickriders/mfaSetupDeadline",
};
