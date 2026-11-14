import { releaseKnobErrors, releaseKnobs } from "./release-rules";

describe("rider release knobs", () => {
  const defaults = releaseKnobs({});

  it("shows the core's defaults when a state never set them", () => {
    expect(defaults).toEqual({
      releaseFreePerDay: 2,
      releaseAlertWeekly: 5,
      releasePauseWeekly: 8,
      releaseDeprioritizeWeekly: 3,
      releaseDeprioritizeDelaySec: 20,
    });
    expect(releaseKnobErrors(defaults)).toEqual([]);
  });

  it("keeps a saved value, including a zero free allowance", () => {
    expect(releaseKnobs({ releaseFreePerDay: 0, releasePauseWeekly: 12 })).toMatchObject({ releaseFreePerDay: 0, releasePauseWeekly: 12, releaseAlertWeekly: 5 });
    expect(releaseKnobErrors({ ...defaults, releaseFreePerDay: 0 })).toEqual([]);
  });

  it("accepts the ends of every range", () => {
    expect(
      releaseKnobErrors({ releaseFreePerDay: 10, releaseAlertWeekly: 50, releasePauseWeekly: 100, releaseDeprioritizeWeekly: 50, releaseDeprioritizeDelaySec: 300 }),
    ).toEqual([]);
    expect(releaseKnobErrors({ releaseFreePerDay: 0, releaseAlertWeekly: 1, releasePauseWeekly: 1, releaseDeprioritizeWeekly: 1, releaseDeprioritizeDelaySec: 1 })).toEqual([]);
  });

  it("rejects values outside their range or not whole", () => {
    expect(releaseKnobErrors({ ...defaults, releaseFreePerDay: 11 })).toEqual(["Free releases per day must be a whole number from 0 to 10."]);
    expect(releaseKnobErrors({ ...defaults, releaseFreePerDay: -1 })).toHaveLength(1);
    expect(releaseKnobErrors({ ...defaults, releaseAlertWeekly: 0 })).toEqual(["Alert staff at must be a whole number from 1 to 50."]);
    expect(releaseKnobErrors({ ...defaults, releasePauseWeekly: 101 })).toEqual(["Pause the rider at must be a whole number from 1 to 100."]);
    expect(releaseKnobErrors({ ...defaults, releaseDeprioritizeWeekly: 2.5 })).toEqual(["Ring later from must be a whole number from 1 to 50."]);
    expect(releaseKnobErrors({ ...defaults, releaseDeprioritizeDelaySec: 0 })).toEqual(["Ring them after must be a whole number of seconds from 1 to 300."]);
    expect(releaseKnobErrors({ ...defaults, releaseDeprioritizeDelaySec: 301 })).toHaveLength(1);
  });

  it("will not pause a rider before staff are alerted", () => {
    expect(releaseKnobErrors({ ...defaults, releaseAlertWeekly: 6, releasePauseWeekly: 5 })).toEqual([
      "Pause the rider at the alert number or later, not before staff are alerted.",
    ]);
    expect(releaseKnobErrors({ ...defaults, releaseAlertWeekly: 6, releasePauseWeekly: 6 })).toEqual([]);
  });
});
