import axios from "axios";

/**
 * Error copy for anything the generated client rejects with. The client itself lives in
 * `@/services` (`apiService`); the admin pages reach it through the typed namespaces in ./api.ts.
 */
export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || (!error.response && error.code === "ERR_NETWORK")) {
      return "The server took too long to respond. Check your connection and try again.";
    }
    if (error.response?.status === 403) return "Your role isn't allowed to do this. Ask a platform admin.";
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
