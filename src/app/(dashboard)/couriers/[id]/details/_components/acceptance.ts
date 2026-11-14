import type { RiderRequestStats } from "@/lib/admin/api";
import { count, percent } from "@/lib/admin/format";

/** Shown on hover over the Acceptance tile's label. */
export const ACCEPTANCE_HELP = "How often this rider takes the requests they're offered. Passing ('Not now') has no penalty.";

/**
 * The Acceptance tile's figure. The core sends `acceptanceRate` as a percentage (0..100, one
 * decimal) and null when the rider neither took nor passed a request in the window. A backend
 * without the field yet (no `requests`) reads as a dash, like the other tiles with no data.
 */
export function acceptanceValue(requests?: RiderRequestStats | null) {
  if (!requests) return "–";
  return requests.acceptanceRate == null ? "No requests yet" : percent(requests.acceptanceRate);
}

/** The counts behind the rate: "41 accepted · 9 passed". */
export function acceptanceHint(requests?: RiderRequestStats | null) {
  if (!requests) return undefined;
  return `${count(requests.accepted)} accepted · ${count(requests.passed)} passed`;
}
