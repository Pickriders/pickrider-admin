import type { StateConfig } from "@/lib/admin/api";

/**
 * Order stacking per state, in two modes that share "Most orders when stacking":
 * - On your way: a rider at "Max active orders per rider" may take one more order when it is on their way
 *   (current order picked up, drop-offs close together, small detour).
 * - Next job: a rider finishing their run may take an order whose pickup is near their last drop-off.
 * Defaults match the core's, so a state that never set them shows what is actually applied.
 */
export type StackingKnobs = Required<
  Pick<
    StateConfig,
    | "stackingEnabled"
    | "maxStackedOrders"
    | "stackDropoffRadiusKm"
    | "stackMaxDetourKm"
    | "nextNearbyEnabled"
    | "nextPickupRadiusKm"
    | "nextFinishWithinKm"
  >
>;

export function stackingKnobs(c: StateConfig): StackingKnobs {
  return {
    stackingEnabled: c.stackingEnabled ?? false,
    maxStackedOrders: c.maxStackedOrders ?? 2,
    stackDropoffRadiusKm: c.stackDropoffRadiusKm ?? 3,
    stackMaxDetourKm: c.stackMaxDetourKm ?? 1.5,
    nextNearbyEnabled: c.nextNearbyEnabled ?? false,
    nextPickupRadiusKm: c.nextPickupRadiusKm ?? 2,
    nextFinishWithinKm: c.nextFinishWithinKm ?? 3,
  };
}

const between = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;

export function stackingKnobErrors(c: StackingKnobs): string[] {
  const out: string[] = [];
  if (!Number.isInteger(c.maxStackedOrders) || !between(c.maxStackedOrders, 2, 3))
    out.push("Most orders when stacking must be 2 or 3.");
  if (!between(c.stackDropoffRadiusKm, 0.1, 20)) out.push("Stacking drop-off distance must be between 0.1 and 20 km.");
  if (!between(c.stackMaxDetourKm, 0, 10)) out.push("Stacking extra distance must be between 0 and 10 km.");
  if (!between(c.nextPickupRadiusKm, 0.1, 20)) out.push("Next job pickup distance must be between 0.1 and 20 km.");
  if (!between(c.nextFinishWithinKm, 0.1, 30)) out.push("Next job finishing distance must be between 0.1 and 30 km.");
  return out;
}

/** Either stacking mode is switched on. */
export function anyStackingOn(c: Pick<StateConfig, "stackingEnabled" | "nextNearbyEnabled">): boolean {
  return Boolean(c.stackingEnabled || c.nextNearbyEnabled);
}

/** Stacking only ever applies when it allows more orders than the normal limit; the core treats it as off otherwise. */
export function stackingNeverApplies(c: StackingKnobs & { maxActiveOrders: number }): boolean {
  return anyStackingOn(c) && c.maxStackedOrders <= c.maxActiveOrders;
}
