import { ROLE_LABEL, staffRoleLabel } from "./roles";

describe("staffRoleLabel", () => {
  it("shows the most senior staff role held", () => {
    expect(staffRoleLabel(["PLATFORM_FINANCE", "SUPER_ADMIN"])).toBe("Super admin");
    expect(staffRoleLabel(["USER", "PLATFORM_OPERATION"])).toBe("Operations");
  });

  it("is undefined without a staff role", () => {
    expect(staffRoleLabel(["USER"])).toBeUndefined();
    expect(staffRoleLabel(undefined)).toBeUndefined();
    expect(staffRoleLabel(null)).toBeUndefined();
  });

  it("keeps the labels the team list uses", () => {
    expect(ROLE_LABEL.PLATFORM_MANAGER).toBe("Manager");
  });
});
