import { formatEmail, formatPersonName, ownerName } from "./person";

describe("formatPersonName", () => {
  it.each([
    ["john doe", "John Doe"],
    ["JOHN DOE", "John Doe"],
    ["  ada   obi ", "Ada Obi"],
    ["obi-okolie", "Obi-Okolie"],
    ["OBI-OKOLIE", "Obi-Okolie"],
    ["o'neil", "O'Neil"],
    ["O’NEIL", "O’Neil"],
    ["McDonald", "McDonald"],
    ["iPhone smith", "iPhone Smith"],
    ["ngozi McDonald-OBI", "Ngozi McDonald-Obi"],
    ["chika\tnwosu\n", "Chika Nwosu"],
    ["élodie ÉMILE", "Élodie Émile"],
  ])("formats %p as %p", (input, expected) => {
    expect(formatPersonName(input)).toBe(expected);
  });

  it("leaves pieces without letters alone", () => {
    expect(formatPersonName("rider 007")).toBe("Rider 007");
    expect(formatPersonName("123")).toBe("123");
  });

  it("returns an empty string for nothing", () => {
    expect(formatPersonName("")).toBe("");
    expect(formatPersonName("   ")).toBe("");
    expect(formatPersonName(null)).toBe("");
    expect(formatPersonName(undefined)).toBe("");
  });

  it("is stable when applied twice", () => {
    const once = formatPersonName("adaeze o'brien-OKAFOR");
    expect(formatPersonName(once)).toBe(once);
  });
});

describe("formatEmail", () => {
  it("trims and lowercases", () => {
    expect(formatEmail("  Ada.Obi@Example.COM ")).toBe("ada.obi@example.com");
  });

  it("returns an empty string for nothing", () => {
    expect(formatEmail(null)).toBe("");
    expect(formatEmail(undefined)).toBe("");
    expect(formatEmail("")).toBe("");
  });
});

describe("ownerName", () => {
  it("cases customers and riders only", () => {
    expect(ownerName({ kind: "CUSTOMER", name: "ada OBI" })).toBe("Ada Obi");
    expect(ownerName({ kind: "RIDER", name: "musa" })).toBe("Musa");
    expect(ownerName({ kind: "BUSINESS", name: "KFC enugu" })).toBe("KFC enugu");
    expect(ownerName({ kind: "TEAM", name: "ops team" })).toBe("ops team");
  });
});
