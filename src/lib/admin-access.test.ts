import * as cookies from "cookies-next";

import { ACTION_ROLES, can, canAccessPath, getAdminRoles } from "./admin-access";

const token = (roles: string[]) => `h.${Buffer.from(JSON.stringify({ roles })).toString("base64")}.s`;

describe("admin-access", () => {
  it("reads staff roles off the JWT and ignores everything else", () => {
    jest.spyOn(cookies, "getCookie").mockReturnValue(token(["SUPER_ADMIN", "PLATFORM_RIDER", "nonsense"]));
    expect(getAdminRoles()).toEqual(["SUPER_ADMIN"]);
  });

  it("returns no roles for a missing or malformed cookie", () => {
    jest.spyOn(cookies, "getCookie").mockReturnValue(undefined);
    expect(getAdminRoles()).toEqual([]);
    jest.spyOn(cookies, "getCookie").mockReturnValue("garbage");
    expect(getAdminRoles()).toEqual([]);
  });

  it("SUPER_ADMIN can do everything; other roles only what the matrix says", () => {
    for (const action of Object.keys(ACTION_ROLES) as (keyof typeof ACTION_ROLES)[]) {
      expect(can(action, ["SUPER_ADMIN"])).toBe(true);
    }
    expect(can("wallet.refund", ["PLATFORM_FINANCE"])).toBe(true);
    expect(can("wallet.refund", ["PLATFORM_OPERATION"])).toBe(false);
    expect(can("announcement.manage", ["PLATFORM_MANAGER"])).toBe(true);
    expect(can("announcement.manage", ["PLATFORM_OPERATION"])).toBe(false);
    expect(can("settings.write", ["PLATFORM_MANAGER"])).toBe(false);
  });

  it("gates sections by path, failing open for unknown sections", () => {
    expect(canAccessPath("/finances/transactions", ["PLATFORM_OPERATION"])).toBe(false);
    expect(canAccessPath("/finances", ["PLATFORM_FINANCE"])).toBe(true);
    expect(canAccessPath("/admin", ["PLATFORM_OPERATION"])).toBe(false);
    expect(canAccessPath("/made-up", ["PLATFORM_OPERATION"])).toBe(true);
  });

  it("an empty role list (no token yet) does not hide buttons; the backend still guards", () => {
    expect(can("wallet.refund", [])).toBe(true);
  });
});
