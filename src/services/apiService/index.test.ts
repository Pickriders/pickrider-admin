/**
 * @jest-environment jsdom
 */
import type { AxiosRequestConfig } from "axios";
import * as cookies from "cookies-next";

import { STORAGE } from "@/constant";
import { apiService } from "./index";

/**
 * The session interceptor in the hand-written wrapper: a 401 must clear the cookie BEFORE
 * redirecting (the middleware sends anyone with a cookie straight back, looping forever), and
 * a 403 must not touch the session at all.
 */
const respond = (status: number) => {
  apiService.instance.defaults.adapter = async (config: AxiosRequestConfig) => {
    const response = { data: { message: "x" }, status, statusText: "", headers: {}, config: config as never };
    if (status >= 400) {
      const error = Object.assign(new Error("Request failed"), { response, config, isAxiosError: true });
      throw error;
    }
    return response;
  };
};

describe("apiService session interceptor", () => {
  const location = { pathname: "/orders", search: "?tab=board", href: "" };
  let deleteSpy: jest.SpyInstance;

  beforeEach(() => {
    Object.defineProperty(window, "location", { value: location, writable: true });
    location.href = "";
    deleteSpy = jest.spyOn(cookies, "deleteCookie").mockImplementation(() => undefined);
  });

  it("a 401 clears the token and sends the person to sign in with a return path", async () => {
    respond(401);
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();

    expect(deleteSpy).toHaveBeenCalledWith(STORAGE.accessToken, { path: "/" });
    expect(location.href).toBe(`/auth/login?redirect=${encodeURIComponent("/orders?tab=board")}&reason=expired`);
  });

  it("a 403 leaves the session alone", async () => {
    respond(403);
    await expect(apiService.adminGetMyProfile()).rejects.toBeTruthy();

    expect(deleteSpy).not.toHaveBeenCalled();
    expect(location.href).toBe("");
  });
});
