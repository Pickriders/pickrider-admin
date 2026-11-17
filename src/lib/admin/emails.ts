import axios from "axios";

import { errorMessage } from "./http";

/**
 * The Emails page: grouping and search over the template registry, the iframe document for a
 * preview, the sample-data editor's validation, and test-send copy. Pure, so it is tested.
 */

export type TemplateLike = {
  key: string;
  name: string;
  audience: string;
  category: string;
  description?: string;
  trigger?: string;
  subject?: string;
};

export const EMAIL_CATEGORY_ORDER = [
  "ACCOUNT",
  "ORDERS",
  "PAYMENTS",
  "RIDERS",
  "DEVELOPERS",
  "ALERTS",
  "MARKETING",
] as const;

export const EMAIL_CATEGORY_LABEL: Record<string, string> = {
  ACCOUNT: "Account and security",
  ORDERS: "Orders",
  PAYMENTS: "Payments",
  RIDERS: "Riders and vehicles",
  DEVELOPERS: "Developer platform",
  ALERTS: "Staff alerts",
  MARKETING: "Marketing",
};

export const EMAIL_AUDIENCE_ORDER = ["CUSTOMER", "RIDER", "BUSINESS", "DEVELOPER", "STAFF", "EVERYONE"] as const;

export const EMAIL_AUDIENCE_LABEL: Record<string, string> = {
  CUSTOMER: "Customers",
  RIDER: "Riders",
  BUSINESS: "Businesses",
  DEVELOPER: "Developers",
  STAFF: "Staff",
  EVERYONE: "Everyone",
};

/** Case-insensitive match on what staff would type: the name, key, subject, description or trigger. */
export function matchesTemplate(template: TemplateLike, search: string | undefined | null) {
  const terms = (search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = [template.name, template.key, template.subject, template.description, template.trigger]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/**
 * Templates filtered by search and audience, grouped by category in the registry's category
 * order (unknown categories last, alphabetically), registry order kept within a group.
 */
export function groupTemplates<T extends TemplateLike>(
  templates: readonly T[] | null | undefined,
  { search, audience }: { search?: string | null; audience?: string | null } = {},
): { category: string; label: string; templates: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const template of templates ?? []) {
    if (audience && template.audience !== audience) continue;
    if (!matchesTemplate(template, search)) continue;
    const list = groups.get(template.category) ?? [];
    list.push(template);
    groups.set(template.category, list);
  }
  const rank = (category: string) => {
    const index = (EMAIL_CATEGORY_ORDER as readonly string[]).indexOf(category);
    return index === -1 ? EMAIL_CATEGORY_ORDER.length : index;
  };
  return Array.from(groups.entries())
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([category, list]) => ({ category, label: EMAIL_CATEGORY_LABEL[category] ?? category, templates: list }));
}

/** How many templates each audience has, for the chip counts. */
export function audienceCounts(templates: readonly TemplateLike[] | null | undefined): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const template of templates ?? []) counts[template.audience] = (counts[template.audience] ?? 0) + 1;
  return counts;
}

export type PreviewScheme = "light" | "dark";

/** Always true and always false media features: stand-ins for prefers-color-scheme inside the iframe. */
const ALWAYS = "(min-width: 0px)";
const NEVER = "(min-width: 100000px)";

/**
 * The preview document for a sandboxed iframe. A browser cannot set `prefers-color-scheme` for one
 * frame, so the template's own colour-scheme media queries are rewritten: for dark, its
 * `(prefers-color-scheme: dark)` rules always apply (what Apple Mail and iOS Mail render); for
 * light, they never do, whatever the viewer's OS is set to. The colour-scheme meta and root are
 * pinned to match, and links open in a new tab instead of inside the frame.
 */
export function previewDocument(html: string, scheme: PreviewScheme): string {
  const dark = scheme === "dark";
  let doc = html
    .replace(/\(\s*prefers-color-scheme\s*:\s*dark\s*\)/gi, dark ? ALWAYS : NEVER)
    .replace(/\(\s*prefers-color-scheme\s*:\s*light\s*\)/gi, dark ? NEVER : ALWAYS)
    .replace(/(<meta\s+name=["'](?:supported-)?color-schemes?["']\s+content=["'])[^"']*(["'])/gi, `$1${scheme}$2`);
  const inject = `<base target="_blank"><style>:root{color-scheme:${scheme} !important}</style>`;
  if (/<\/head>/i.test(doc)) doc = doc.replace(/<\/head>/i, `${inject}</head>`);
  else if (/<body[^>]*>/i.test(doc)) doc = doc.replace(/<body[^>]*>/i, (body) => `${inject}${body}`);
  else doc = `${inject}${doc}`;
  return doc;
}

/** True when the template ships dark-mode rules at all, so the toggle can say when it has no effect. */
export function hasDarkStyles(html: string | null | undefined) {
  return /prefers-color-scheme\s*:\s*dark/i.test(html ?? "");
}

export const PREVIEW_WIDTH = { desktop: 600, mobile: 375 } as const;
export type PreviewDevice = keyof typeof PREVIEW_WIDTH;

/**
 * Validates the sample-data editor: a JSON object (not an array, not null), at most 20 KB so a
 * paste cannot hang the render. Returns the parsed object or the reason it cannot be used.
 */
export const SAMPLE_DATA_MAX_CHARS = 20_000;

export function parseSampleVariables(
  text: string,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: 'Add the sample data as a JSON object, for example {"name": "Ada"}.' };
  if (trimmed.length > SAMPLE_DATA_MAX_CHARS)
    return { ok: false, error: "That is too much sample data. Keep it under 20,000 characters." };
  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch (error) {
    const reason = error instanceof Error ? error.message.replace(/^JSON\.parse:\s*/i, "") : "";
    return { ok: false, error: reason ? `That is not valid JSON: ${reason}` : "That is not valid JSON." };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Sample data must be a JSON object with one field per variable." };
  }
  return { ok: true, value: value as Record<string, unknown> };
}

/** Pretty JSON for the editor. */
export function formatSampleVariables(variables: unknown) {
  return JSON.stringify(variables ?? {}, null, 2);
}

/** Variables the template uses that the edited data leaves out (they render empty). */
export function missingVariables(expected: readonly string[] | null | undefined, data: Record<string, unknown>) {
  return (expected ?? []).filter((name) => !(name.split(".")[0] in data));
}

type Queued = { templateKey: string; recipient: string; status: string };

/** Counts per outcome for a test-send answer. */
export function summariseQueued(queued: readonly Queued[] | null | undefined) {
  const out = { queued: 0, sent: 0, failed: 0, duplicate: 0 };
  for (const row of queued ?? []) {
    if (row.status in out) out[row.status as keyof typeof out] += 1;
  }
  return out;
}

/** The toast after a test send: how many went out, to whom, and anything that did not. */
export function testSendMessage(
  result: { count: number; queued: readonly Queued[] } | null | undefined,
  recipients: readonly string[],
) {
  const summary = summariseQueued(result?.queued);
  const total = result?.count ?? result?.queued.length ?? 0;
  const to = recipients.length === 1 ? recipients[0] : `${recipients.length} addresses`;
  const accepted = summary.queued + summary.sent;
  const head =
    total === 1 ? `Test email on its way to ${to}` : `${accepted} of ${total} test emails on their way to ${to}`;
  const notes = [
    summary.failed ? `${summary.failed} failed` : "",
    summary.duplicate ? `${summary.duplicate} already sent` : "",
  ].filter(Boolean);
  return notes.length ? `${head} (${notes.join(", ")})` : head;
}

/** A 429 from the per-admin test-send limit reads as advice, not an error code. */
export function testSendErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    return "That's a lot of test emails in a minute. Wait a minute, then send again.";
  }
  return errorMessage(error);
}

/** A registry key as a title: "order-receipt" -> "Order receipt". */
export function templateTitle(key: string | null | undefined) {
  const words = (key ?? "").trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  return words ? words[0].toUpperCase() + words.slice(1) : "";
}
