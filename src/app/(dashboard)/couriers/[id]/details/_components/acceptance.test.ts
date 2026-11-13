import { ACCEPTANCE_HELP, acceptanceHint, acceptanceValue } from "./acceptance";

describe("rider acceptance tile", () => {
  it("shows the core's percentage with one decimal", () => {
    expect(acceptanceValue({ accepted: 33, passed: 7, acceptanceRate: 82.5 })).toBe("82.5%");
    expect(acceptanceValue({ accepted: 5, passed: 0, acceptanceRate: 100 })).toBe("100.0%");
    expect(acceptanceValue({ accepted: 0, passed: 4, acceptanceRate: 0 })).toBe("0.0%");
  });

  it("says so when the rider had no requests in the window", () => {
    expect(acceptanceValue({ accepted: 0, passed: 0, acceptanceRate: null })).toBe("No requests yet");
  });

  it("falls back to a dash when the backend sends no request stats", () => {
    expect(acceptanceValue(undefined)).toBe("–");
    expect(acceptanceHint(undefined)).toBeUndefined();
  });

  it("captions the counts behind the rate", () => {
    expect(acceptanceHint({ accepted: 41, passed: 9, acceptanceRate: 82 })).toBe("41 accepted · 9 passed");
    expect(acceptanceHint({ accepted: 1200, passed: 0, acceptanceRate: 100 })).toBe("1,200 accepted · 0 passed");
  });

  it("explains that passing carries no penalty", () => {
    expect(ACCEPTANCE_HELP).toBe("How often this rider takes the requests they're offered. Passing ('Not now') has no penalty.");
  });
});
