import { isE164, secondsToMinutes, toE164 } from "./phone";

describe("phone helpers", () => {
  it("accepts E.164 and rejects local or partial numbers", () => {
    expect(isE164("+2348012345678")).toBe(true);
    expect(isE164("+14155550123")).toBe(true);
    expect(isE164("08012345678")).toBe(false);
    expect(isE164("+0801234")).toBe(false);
    expect(isE164("+234")).toBe(false);
    expect(isE164("")).toBe(false);
  });

  it("normalises Nigerian numbers staff usually type", () => {
    expect(toE164("0803 123 4567")).toBe("+2348031234567");
    expect(toE164("2348031234567")).toBe("+2348031234567");
    expect(toE164("+234 (803) 123-4567")).toBe("+2348031234567");
    expect(toE164("")).toBe("");
    // Not a recognisable local number: left for validation to reject.
    expect(toE164("12345")).toBe("12345");
  });

  it("shows stored seconds as minutes", () => {
    expect(secondsToMinutes(180)).toBe(3);
    expect(secondsToMinutes(90)).toBe(1.5);
    expect(secondsToMinutes(100)).toBe(1.67);
  });
});
