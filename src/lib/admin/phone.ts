/**
 * Phone helpers for staff-typed numbers. The core stores E.164 (+2348012345678) for anything it
 * messages, such as the support WhatsApp number urgent alerts escalate to.
 */
const E164 = /^\+[1-9]\d{7,14}$/;

export function isE164(value: string) {
  return E164.test(value);
}

/**
 * Turns what staff usually type into E.164: "0803 123 4567" and "2348031234567" become
 * "+2348031234567". Anything else comes back without spaces for validation to judge.
 */
export function toE164(raw: string) {
  const compact = raw.replace(/[\s()-]/g, "");
  if (!compact) return "";
  if (/^0\d{10}$/.test(compact)) return `+234${compact.slice(1)}`;
  if (/^234\d{10}$/.test(compact)) return `+${compact}`;
  return compact;
}

/** Seconds as minutes for a settings input, to two decimals (180 -> 3, 90 -> 1.5). */
export function secondsToMinutes(seconds: number) {
  return Math.round((seconds / 60) * 100) / 100;
}
