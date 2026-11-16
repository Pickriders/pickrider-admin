/** Display names for account roles, shared by the team list and the sidebar account card. */
export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  PLATFORM_ADMIN: "Platform admin",
  PLATFORM_MANAGER: "Manager",
  PLATFORM_OPERATION: "Operations",
  PLATFORM_FINANCE: "Finance",
  USER: "User",
  PLATFORM_RIDER: "Platform rider",
  DEVELOPER: "Developer",
};

/** Staff roles, most senior first: the one a person is shown as. */
const SENIORITY = ["SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN", "PLATFORM_MANAGER", "PLATFORM_OPERATION", "PLATFORM_FINANCE"];

/** The label of the most senior staff role held, or undefined when none is a staff role. */
export const staffRoleLabel = (roles?: readonly string[] | null): string | undefined => {
  const held = SENIORITY.find((role) => roles?.includes(role));
  return held ? ROLE_LABEL[held] : undefined;
};
