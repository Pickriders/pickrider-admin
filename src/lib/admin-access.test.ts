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
    expect(can("handoff.manage", ["PLATFORM_OPERATION"])).toBe(true);
    expect(can("handoff.manage", ["PLATFORM_FINANCE"])).toBe(false);
    expect(can("alert.handle", ["PLATFORM_FINANCE"])).toBe(false);
    // Email test sends: PlatformAdminRoles on the core, the same roles as settings.write.
    expect(can("email.testSend", ["PLATFORM_ADMIN"])).toBe(true);
    expect(can("email.testSend", ["PLATFORM_MANAGER"])).toBe(false);
    expect(can("email.testSend", ["PLATFORM_OPERATION"])).toBe(false);
    // Account erasure and clearing a sign-in lockout are the owner's alone; looking a lockout up is for admins.
    expect(can("user.erase", ["ADMIN"])).toBe(false);
    expect(can("user.erase", ["PLATFORM_ADMIN"])).toBe(false);
    expect(can("security.unlock", ["ADMIN"])).toBe(false);
    expect(can("security.lockouts", ["PLATFORM_ADMIN"])).toBe(true);
    expect(can("security.lockouts", ["PLATFORM_MANAGER"])).toBe(false);
    expect(can("withdrawals.freeze", ["PLATFORM_ADMIN"])).toBe(true);
    expect(can("withdrawals.freeze", ["PLATFORM_FINANCE"])).toBe(false);
    // Email switches and pauses: the owner changes them, every staff role sees them.
    for (const role of ["ADMIN", "PLATFORM_ADMIN", "PLATFORM_MANAGER", "PLATFORM_FINANCE"] as const) {
      expect(can("email.controls", [role])).toBe(false);
      expect(can("email.controlsRead", [role])).toBe(true);
    }
  });

  it("opens the message log and the email gallery to every staff role (PlatformReadRoles)", () => {
    for (const role of ["PLATFORM_FINANCE", "PLATFORM_OPERATION", "PLATFORM_MANAGER", "ADMIN"] as const) {
      expect(canAccessPath("/messages", [role])).toBe(true);
      expect(canAccessPath("/emails", [role])).toBe(true);
    }
  });

  it("gates sections by path, failing open for unknown sections", () => {
    expect(canAccessPath("/finances/transactions", ["PLATFORM_OPERATION"])).toBe(false);
    expect(canAccessPath("/finances", ["PLATFORM_FINANCE"])).toBe(true);
    expect(canAccessPath("/admin", ["PLATFORM_OPERATION"])).toBe(false);
    expect(canAccessPath("/made-up", ["PLATFORM_OPERATION"])).toBe(true);
    expect(canAccessPath("/alerts", ["PLATFORM_OPERATION"])).toBe(true);
    expect(canAccessPath("/alerts", ["PLATFORM_FINANCE"])).toBe(false);
    expect(canAccessPath("/handoffs", ["PLATFORM_FINANCE"])).toBe(true);
  });

  it("an empty role list (no token yet) does not hide buttons; the backend still guards", () => {
    expect(can("wallet.refund", [])).toBe(true);
  });
});
