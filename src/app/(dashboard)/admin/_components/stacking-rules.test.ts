import { anyStackingOn, stackingKnobErrors, stackingKnobs, stackingNeverApplies } from "./stacking-rules";

describe("order stacking knobs", () => {
  const defaults = stackingKnobs({});

  it("shows the core's defaults when a state never set them", () => {
    expect(defaults).toEqual({
      stackingEnabled: false,
      maxStackedOrders: 2,
      stackDropoffRadiusKm: 3,
      stackMaxDetourKm: 1.5,
      nextNearbyEnabled: false,
      nextPickupRadiusKm: 2,
      nextFinishWithinKm: 3,
    });
    expect(stackingKnobErrors(defaults)).toEqual([]);
  });

  it("keeps a saved value, including a zero detour", () => {
    expect(stackingKnobs({ stackingEnabled: true, maxStackedOrders: 3, stackMaxDetourKm: 0 })).toEqual({
      ...defaults,
      stackingEnabled: true,
      maxStackedOrders: 3,
      stackMaxDetourKm: 0,
    });
  });

  it("keeps saved next job values", () => {
    expect(stackingKnobs({ nextNearbyEnabled: true, nextPickupRadiusKm: 0.5, nextFinishWithinKm: 10 })).toEqual({
      ...defaults,
      nextNearbyEnabled: true,
      nextPickupRadiusKm: 0.5,
      nextFinishWithinKm: 10,
    });
  });

  it("accepts the ends of every range", () => {
    expect(
      stackingKnobErrors({
        ...defaults,
        maxStackedOrders: 2,
        stackDropoffRadiusKm: 0.1,
        stackMaxDetourKm: 0,
        nextPickupRadiusKm: 0.1,
        nextFinishWithinKm: 0.1,
      }),
    ).toEqual([]);
    expect(
      stackingKnobErrors({
        ...defaults,
        maxStackedOrders: 3,
        stackDropoffRadiusKm: 20,
        stackMaxDetourKm: 10,
        nextPickupRadiusKm: 20,
        nextFinishWithinKm: 30,
      }),
    ).toEqual([]);
  });

  it("rejects values outside their range or not whole", () => {
    expect(stackingKnobErrors({ ...defaults, maxStackedOrders: 1 })).toEqual([
      "Most orders when stacking must be 2 or 3.",
    ]);
    expect(stackingKnobErrors({ ...defaults, maxStackedOrders: 4 })).toHaveLength(1);
    expect(stackingKnobErrors({ ...defaults, maxStackedOrders: 2.5 })).toHaveLength(1);
    expect(stackingKnobErrors({ ...defaults, stackDropoffRadiusKm: 0 })).toEqual([
      "Stacking drop-off distance must be between 0.1 and 20 km.",
    ]);
    expect(stackingKnobErrors({ ...defaults, stackDropoffRadiusKm: 20.5 })).toHaveLength(1);
    expect(stackingKnobErrors({ ...defaults, stackMaxDetourKm: -0.1 })).toEqual([
      "Stacking extra distance must be between 0 and 10 km.",
    ]);
    expect(stackingKnobErrors({ ...defaults, stackMaxDetourKm: 11 })).toHaveLength(1);
    expect(stackingKnobErrors({ ...defaults, stackDropoffRadiusKm: Number.NaN })).toHaveLength(1);
  });

  it("rejects next job distances outside their range", () => {
    expect(stackingKnobErrors({ ...defaults, nextPickupRadiusKm: 0 })).toEqual([
      "Next job pickup distance must be between 0.1 and 20 km.",
    ]);
    expect(stackingKnobErrors({ ...defaults, nextPickupRadiusKm: 20.1 })).toHaveLength(1);
    expect(stackingKnobErrors({ ...defaults, nextFinishWithinKm: 0.05 })).toEqual([
      "Next job finishing distance must be between 0.1 and 30 km.",
    ]);
    expect(stackingKnobErrors({ ...defaults, nextFinishWithinKm: 31 })).toHaveLength(1);
    expect(stackingKnobErrors({ ...defaults, nextFinishWithinKm: Number.NaN })).toHaveLength(1);
  });

  it("knows when either mode is on", () => {
    expect(anyStackingOn({})).toBe(false);
    expect(anyStackingOn({ stackingEnabled: true })).toBe(true);
    expect(anyStackingOn({ nextNearbyEnabled: true })).toBe(true);
    expect(anyStackingOn({ stackingEnabled: false, nextNearbyEnabled: false })).toBe(false);
  });

  it("flags stacking that can never apply because the normal limit already allows as many orders", () => {
    expect(stackingNeverApplies({ ...defaults, stackingEnabled: true, maxActiveOrders: 1 })).toBe(false);
    expect(stackingNeverApplies({ ...defaults, stackingEnabled: true, maxActiveOrders: 2 })).toBe(true);
    expect(stackingNeverApplies({ ...defaults, nextNearbyEnabled: true, maxActiveOrders: 2 })).toBe(true);
    expect(stackingNeverApplies({ ...defaults, nextNearbyEnabled: true, maxActiveOrders: 1 })).toBe(false);
    expect(stackingNeverApplies({ ...defaults, maxActiveOrders: 2 })).toBe(false);
  });
});
