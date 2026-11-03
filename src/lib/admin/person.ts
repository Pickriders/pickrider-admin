/**
 * Casing for people, applied when a name or email is shown and before one is sent. Business and
 * store names, item names, addresses and free text are never passed through here: "KFC" stays "KFC".
 */

import type { TransactionOwner } from "./api";

/** One hyphen or apostrophe separated piece: "obi", "NEIL", "McDonald". */
function caseSegment(segment: string) {
  if (!/\p{L}/u.test(segment)) return segment;
  const lower = segment.toLowerCase();
  const upper = segment.toUpperCase();
  // Mixed case ("McDonald", "DeShawn") is how the person spells it: keep it.
  if (segment !== lower && segment !== upper) return segment;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** "  ada   OBI-okolie " -> "Ada Obi-Okolie", "o'neil" -> "O'Neil", "McDonald" stays. */
export function formatPersonName(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split(/([-'’])/)
        .map((part) => (/^[-'’]$/.test(part) ? part : caseSegment(part)))
        .join(""),
    )
    .join(" ");
}

/** Emails are case-insensitive in practice; show and send them lowercased. */
export function formatEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** A wallet owner's name: customers and riders are people and get cased; business, team and platform names stay as entered. */
export function ownerName(owner: Pick<TransactionOwner, "kind" | "name">): string {
  if (owner.kind !== "CUSTOMER" && owner.kind !== "RIDER") return owner.name;
  return formatPersonName(owner.name) || owner.name;
}
