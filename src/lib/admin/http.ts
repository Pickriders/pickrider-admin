import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next";

import { API_URL, STORAGE } from "@/constant";

/**
 * One axios client for the admin. The generated swagger client drifted from
 * the API and several call sites pointed at methods that no longer existed;
 * this talks to the routes directly and is typed by hand in ./api.ts.
 */
export const http = axios.create({ baseURL: API_URL, timeout: 45_000 });

http.interceptors.request.use((config) => {
  const token = getCookie(STORAGE.accessToken)?.toString();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A dead token sends the person back to sign in with a return path.
    if (error.response?.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      const back = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?redirect=${back}`;
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || (!error.response && error.code === "ERR_NETWORK")) {
      return "The server took too long to respond. Check your connection and try again.";
    }
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
