import { passwordRules, passwordStrength, validatePasswordChange } from "./password";

describe("password change checks", () => {
  it("grades strength", () => {
    expect(passwordStrength("")).toBeNull();
    expect(passwordStrength("short")).toBe("weak");
    expect(passwordStrength("longenough")).toBe("ok");
    expect(passwordStrength("Longer-pass-123")).toBe("strong");
  });

  it("validates current, length, reuse and the confirmation", () => {
    expect(validatePasswordChange("", "abc", "abd")).toEqual({
      current: "Enter your current password.",
      next: "Use at least 8 characters.",
      confirm: "The two passwords do not match.",
    });
    expect(validatePasswordChange("same-pass", "same-pass", "same-pass")).toEqual({
      next: "Pick a password you have not used here before.",
    });
    expect(validatePasswordChange("old-pass", "new-pass-1", "new-pass-1")).toEqual({});
  });

  it("ticks each rule as it is met", () => {
    const met = (current: string, next: string, confirm: string) =>
      Object.fromEntries(passwordRules(current, next, confirm).map((rule) => [rule.id, rule.met]));
    expect(met("old", "", "")).toEqual({ length: false, mixed: false, different: false, match: false });
    expect(met("old", "New-pass-1", "New-pass-1")).toEqual({ length: true, mixed: true, different: true, match: true });
    expect(met("same-pass", "same-pass", "other")).toEqual({
      length: true,
      mixed: false,
      different: false,
      match: false,
    });
  });
});
