import { AxiosError, AxiosHeaders } from "axios";

import { errorMessage } from "./http";

const axiosError = (status?: number, data?: unknown, code?: string) => {
  const error = new AxiosError("Request failed", code);
  if (status) error.response = { status, data, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } };
  return error;
};

describe("errorMessage", () => {
  it("reads the backend message, joining validation arrays", () => {
    expect(errorMessage(axiosError(400, { message: "Nope" }))).toBe("Nope");
    expect(errorMessage(axiosError(400, { message: ["a", "b"] }))).toBe("a, b");
  });

  it("explains a 403 as a role problem", () => {
    expect(errorMessage(axiosError(403, { message: "Forbidden" }))).toMatch(/role/i);
  });

  it("explains timeouts and dead networks", () => {
    expect(errorMessage(axiosError(undefined, undefined, "ECONNABORTED"))).toMatch(/too long/);
    expect(errorMessage(axiosError(undefined, undefined, "ERR_NETWORK"))).toMatch(/too long/);
  });

  it("falls back for plain errors and unknowns", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage(null, "fallback")).toBe("fallback");
  });
});
