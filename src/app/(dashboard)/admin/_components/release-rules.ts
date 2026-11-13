import type { StateConfig } from "@/lib/admin/api";

/**
 * Rider releases ("Can't make it") per state: how many early releases stay free each day, and the
 * 7-day counts that ring a rider later, alert staff, and pause them. Defaults match the core's,
 * so a state that never set them shows what is actually applied.
 */
export type ReleaseKnobs = Required<
  Pick<StateConfig, "releaseFreePerDay" | "releaseAlertWeekly" | "releasePauseWeekly" | "releaseDeprioritizeWeekly" | "releaseDeprioritizeDelaySec">
>;

export function releaseKnobs(c: StateConfig): ReleaseKnobs {
  return {
    releaseFreePerDay: c.releaseFreePerDay ?? 2,
    releaseAlertWeekly: c.releaseAlertWeekly ?? 5,
    releasePauseWeekly: c.releasePauseWeekly ?? 8,
    releaseDeprioritizeWeekly: c.releaseDeprioritizeWeekly ?? 3,
    releaseDeprioritizeDelaySec: c.releaseDeprioritizeDelaySec ?? 20,
  };
}

const whole = (value: number, min: number, max: number) => Number.isInteger(value) && value >= min && value <= max;

export function releaseKnobErrors(c: ReleaseKnobs): string[] {
  const out: string[] = [];
  if (!whole(c.releaseFreePerDay, 0, 10)) out.push("Free releases per day must be a whole number from 0 to 10.");
  if (!whole(c.releaseAlertWeekly, 1, 50)) out.push("Alert staff at must be a whole number from 1 to 50.");
  if (!whole(c.releasePauseWeekly, 1, 100)) out.push("Pause the rider at must be a whole number from 1 to 100.");
  else if (c.releasePauseWeekly < c.releaseAlertWeekly) out.push("Pause the rider at the alert number or later, not before staff are alerted.");
  if (!whole(c.releaseDeprioritizeWeekly, 1, 50)) out.push("Ring later from must be a whole number from 1 to 50.");
  if (!whole(c.releaseDeprioritizeDelaySec, 1, 300)) out.push("Ring them after must be a whole number of seconds from 1 to 300.");
  return out;
}
