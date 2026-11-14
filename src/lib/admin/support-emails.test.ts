import { SUPPORT_EMAILS_MAX, addSupportEmails, cleanSupportEmails, isEmail, sameEmails, splitEmails, supportEmailErrors, testEmailSentMessage } from "./support-emails";

describe("support emails", () => {
  it("recognises email addresses", () => {
    expect(isEmail("ops@pickriders.com")).toBe(true);
    expect(isEmail(" Ops.Team+alerts@mail.pickriders.com ")).toBe(true);
    expect(isEmail("ops@pickriders")).toBe(false);
    expect(isEmail("ops pickriders.com")).toBe(false);
    expect(isEmail("@pickriders.com")).toBe(false);
    expect(isEmail("")).toBe(false);
  });

  it("splits a pasted list on commas, semicolons, spaces and new lines, lowercased", () => {
    expect(splitEmails("A@x.com, b@y.com;c@z.com\nD@W.COM  ")).toEqual(["a@x.com", "b@y.com", "c@z.com", "d@w.com"]);
    expect(splitEmails("   ")).toEqual([]);
  });

  it("adds new addresses lowercased and skips ones already listed", () => {
    expect(addSupportEmails(["ops@pickriders.com"], "OPS@pickriders.com, Lead@Pickriders.com")).toEqual({
      list: ["ops@pickriders.com", "lead@pickriders.com"],
      rejected: [],
      error: null,
    });
  });

  it("keeps an invalid address back with a reason", () => {
    const out = addSupportEmails([], "good@x.com nope");
    expect(out.list).toEqual(["good@x.com"]);
    expect(out.rejected).toEqual(["nope"]);
    expect(out.error).toBe('"nope" is not an email address.');
  });

  it("stops at five", () => {
    const four = ["a@x.com", "b@x.com", "c@x.com", "d@x.com"];
    const out = addSupportEmails(four, "e@x.com f@x.com");
    expect(out.list).toHaveLength(SUPPORT_EMAILS_MAX);
    expect(out.rejected).toEqual(["f@x.com"]);
    expect(out.error).toBe("Up to 5 support emails.");
  });

  it("flags lists that cannot be saved", () => {
    expect(supportEmailErrors([])).toEqual([]);
    expect(supportEmailErrors(["a@x.com"])).toEqual([]);
    expect(supportEmailErrors(["a@x.com", "bad"])).toEqual(["Not an email address: bad."]);
    expect(supportEmailErrors(["a@x.com", "b@x.com", "c@x.com", "d@x.com", "e@x.com", "f@x.com"])).toEqual(["Up to 5 support emails."]);
    expect(supportEmailErrors(["a@x.com", "A@x.com"])).toEqual(["A support email is listed twice."]);
  });

  it("cleans a stored list and compares lists the way they are saved", () => {
    expect(cleanSupportEmails([" A@x.com", "a@x.com", "", "b@x.com"])).toEqual(["a@x.com", "b@x.com"]);
    expect(cleanSupportEmails(undefined)).toEqual([]);
    expect(sameEmails(["A@x.com"], ["a@x.com"])).toBe(true);
    expect(sameEmails(undefined, [])).toBe(true);
    expect(sameEmails(["a@x.com", "b@x.com"], ["b@x.com", "a@x.com"])).toBe(false);
    expect(sameEmails(["a@x.com"], [])).toBe(false);
  });

  it("says where the test email went", () => {
    expect(testEmailSentMessage(["a@x.com", "b@y.com"])).toBe("Test email sent to a@x.com, b@y.com");
    expect(testEmailSentMessage([])).toBe("Test email sent");
  });
});
