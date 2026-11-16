import { countdownLabel } from "./withdrawal-freeze";

describe("withdrawal freeze countdown", () => {
  const now = Date.parse("2026-11-15T10:00:00.000Z");

  it("is empty for an open-ended freeze or one that already lifted", () => {
    expect(countdownLabel(null, now)).toBeNull();
    expect(countdownLabel(undefined, now)).toBeNull();
    expect(countdownLabel("2026-11-15T09:59:59.000Z", now)).toBeNull();
    expect(countdownLabel("not a date", now)).toBeNull();
  });

  it("shows minutes and seconds under an hour, hours and minutes under a day, then days", () => {
    expect(countdownLabel("2026-11-15T10:00:45.000Z", now)).toBe("0:45");
    expect(countdownLabel("2026-11-15T10:12:05.000Z", now)).toBe("12:05");
    expect(countdownLabel("2026-11-15T12:05:00.000Z", now)).toBe("2h 05m");
    expect(countdownLabel("2026-11-18T14:00:00.000Z", now)).toBe("3d 4h");
  });
});
