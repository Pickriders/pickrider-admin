import { AxiosError } from "axios";
import { deleteCookie, getCookie } from "cookies-next";

import { BASE_URL, STORAGE } from "@/constant";
import { Api } from "./Api";

/**
 * The one HTTP client for the admin. `Api` is generated from the backend's Swagger document
 * (`yarn generate-types`); this file is the only hand-written piece in the folder and owns the
 * session concerns: the bearer token on every request and what to do when it dies.
 */
type SecurityDataType = { token?: string };

const apiService = new Api<SecurityDataType>({
  baseURL: BASE_URL,
  timeout: 45_000,
  timeoutErrorMessage: "Network error",
  securityWorker: async (securityData) => {
    const token = securityData?.token ?? getCookie(STORAGE.accessToken)?.toString();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  },
});

let redirecting = false;

apiService.instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A dead token sends the person back to sign in with a return path. The cookie must go first:
    // the middleware bounces anyone who still has one straight back to /dashboard, and the next
    // 401 would send them here again — an endless loop. A 403 is a role problem, not a session
    // problem, so it stays on the page and surfaces through errorMessage().
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth") &&
      !redirecting
    ) {
      redirecting = true;
      deleteCookie(STORAGE.accessToken, { path: "/" });
      const back = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?redirect=${back}&reason=expired`;
    }
    return Promise.reject(error);
  },
);

export { apiService };

export * from "./ApiRoute";
export * from "./data-contracts";
