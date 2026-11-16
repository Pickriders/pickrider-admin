/** Checks for the signed-in admin's password change, run before the API sees anything. */
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordStrength = "weak" | "ok" | "strong";
export type PasswordErrors = Partial<Record<"current" | "next" | "confirm", string>>;

export function passwordStrength(value: string): PasswordStrength | null {
  if (!value) return null;
  if (value.length >= 12 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) return "strong";
  return value.length >= MIN_PASSWORD_LENGTH ? "ok" : "weak";
}

/** The rules shown under the form, each ticked as it is met. */
export function passwordRules(
  current: string,
  next: string,
  confirm: string,
): { id: string; label: string; met: boolean }[] {
  return [
    { id: "length", label: `At least ${MIN_PASSWORD_LENGTH} characters`, met: next.length >= MIN_PASSWORD_LENGTH },
    {
      id: "mixed",
      label: "Upper case, a number and a symbol (for a strong one)",
      met: /[A-Z]/.test(next) && /[0-9]/.test(next) && /[^A-Za-z0-9]/.test(next),
    },
    { id: "different", label: "Different from your current password", met: Boolean(next) && next !== current },
    { id: "match", label: "Both new passwords match", met: Boolean(next) && confirm === next },
  ];
}

export function validatePasswordChange(current: string, next: string, confirm: string): PasswordErrors {
  const found: PasswordErrors = {};
  if (!current) found.current = "Enter your current password.";
  if (next.length < MIN_PASSWORD_LENGTH) found.next = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  else if (next === current) found.next = "Pick a password you have not used here before.";
  if (confirm !== next) found.confirm = "The two passwords do not match.";
  return found;
}
