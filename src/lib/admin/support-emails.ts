/**
 * Support email lists (per state and platform-wide): the inboxes core emails when an urgent rider
 * alert goes unclaimed. The core trims, lowercases and dedupes too; checking here keeps the
 * form honest before it is saved.
 */
export const SUPPORT_EMAILS_MAX = 5;

const EMAIL = /^[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}$/i;

export function normaliseEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmail(value: string) {
  return EMAIL.test(value.trim());
}

/** One or many addresses typed or pasted at once: commas, semicolons, spaces and new lines all split. */
export function splitEmails(text: string) {
  return text
    .split(/[\s,;]+/)
    .map(normaliseEmail)
    .filter(Boolean);
}

/**
 * Adds what was typed to the list: lowercased, without repeats, at most five. Anything that is not
 * an address, or does not fit, comes back in `rejected` with the reason so the input can keep it.
 */
export function addSupportEmails(current: string[], text: string): { list: string[]; rejected: string[]; error: string | null } {
  const list = [...current];
  const rejected: string[] = [];
  let error: string | null = null;
  for (const email of splitEmails(text)) {
    if (list.includes(email)) continue;
    if (!isEmail(email)) {
      rejected.push(email);
      error ??= `"${email}" is not an email address.`;
      continue;
    }
    if (list.length >= SUPPORT_EMAILS_MAX) {
      rejected.push(email);
      error ??= `Up to ${SUPPORT_EMAILS_MAX} support emails.`;
      continue;
    }
    list.push(email);
  }
  return { list, rejected, error };
}

/** What blocks saving a list (it can only get this way from stored data or a bad paste). */
export function supportEmailErrors(list: string[]): string[] {
  const out: string[] = [];
  const bad = list.filter((email) => !isEmail(email));
  if (bad.length) out.push(`Not an email address: ${bad.join(", ")}.`);
  if (list.length > SUPPORT_EMAILS_MAX) out.push(`Up to ${SUPPORT_EMAILS_MAX} support emails.`);
  if (new Set(list.map(normaliseEmail)).size !== list.length) out.push("A support email is listed twice.");
  return out;
}

/** The list as it is saved: trimmed, lowercased, deduplicated, order kept. */
export function cleanSupportEmails(list: readonly string[] | null | undefined): string[] {
  return Array.from(new Set((list ?? []).map(normaliseEmail).filter(Boolean)));
}

export function sameEmails(a: readonly string[] | null | undefined, b: readonly string[] | null | undefined) {
  const left = cleanSupportEmails(a);
  const right = cleanSupportEmails(b);
  return left.length === right.length && left.every((email, i) => email === right[i]);
}

export function testEmailSentMessage(sentTo: string[] | null | undefined) {
  return sentTo?.length ? `Test email sent to ${sentTo.join(", ")}` : "Test email sent";
}
