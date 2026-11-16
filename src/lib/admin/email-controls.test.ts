import {
  activePauses,
  controlFor,
  emailKind,
  emailStatusLine,
  kindHint,
  lagosInputValue,
  liftedByLabel,
  parseLagosInput,
  pauseBannerText,
  pauseBody,
  pauseCountdown,
  pauseDismissKey,
  pauseInEffect,
  quickPickUntil,
  switchLock,
  templateSwitchBody,
  type ControlLike,
} from "./email-controls";

const row = (patch: Partial<ControlLike> = {}): ControlLike => ({
  key: "welcome",
  emailChannel: true,
  enabled: true,
  essential: false,
  essentialReason: null,
  marketing: false,
  lockedReason: null,
  disabledReason: null,
  disabledBy: null,
  disabledAt: null,
  skipReason: null,
  ...patch,
});

describe("kind", () => {
  it("is essential first, then marketing, else transactional", () => {
    expect(emailKind({ essential: true, marketing: false })).toBe("essential");
    expect(emailKind({ essential: true, marketing: true })).toBe("essential");
    expect(emailKind({ essential: false, marketing: true })).toBe("marketing");
    expect(emailKind({ essential: false, marketing: false })).toBe("transactional");
  });

  it("explains each kind, with the essential reason when the core gives one", () => {
    expect(kindHint({ essential: true, marketing: false, essentialReason: "One-time verification code" })).toBe(
      "Always sends: One-time verification code. It cannot be turned off or paused.",
    );
    expect(kindHint({ essential: true, marketing: false, essentialReason: null })).toBe("Always sends. It cannot be turned off or paused.");
    expect(kindHint({ essential: false, marketing: true })).toMatch(/marketing emails are paused/);
    expect(kindHint({ essential: false, marketing: false })).toMatch(/non-essential pause/);
  });
});

describe("essential lock", () => {
  it("locks essential emails for everyone, super admin included, with the core's reason", () => {
    const essential = row({ key: "verification-code", essential: true, essentialReason: "One-time verification code", lockedReason: "Essential: One-time verification code" });
    expect(switchLock(essential, true)).toEqual({ locked: true, reason: "Essential: One-time verification code" });
    expect(switchLock(essential, false)).toEqual({ locked: true, reason: "Essential: One-time verification code" });
  });

  it("still locks an essential row when the core sent no lockedReason", () => {
    expect(switchLock(row({ essential: true, essentialReason: "Password reset code" }), true)).toEqual({ locked: true, reason: "Essential: Password reset code" });
    expect(switchLock(row({ essential: true }), true)).toEqual({ locked: true, reason: "Essential: always sends" });
  });

  it("locks push-only rows", () => {
    expect(switchLock(row({ emailChannel: false, lockedReason: "Not sent by email (push only)" }), true)).toEqual({ locked: true, reason: "Not sent by email (push only)" });
    expect(switchLock(row({ emailChannel: false }), true).locked).toBe(true);
  });

  it("opens the switch only for a super admin", () => {
    expect(switchLock(row(), true)).toEqual({ locked: false, reason: null });
    expect(switchLock(row({ marketing: true }), true)).toEqual({ locked: false, reason: null });
    expect(switchLock(row(), false)).toEqual({ locked: true, reason: "Only a super admin can turn emails on or off." });
  });

  it("needs a reason to turn off, not to turn back on", () => {
    expect(templateSwitchBody(false, "  Copy is being rewritten ")).toEqual({ ok: true, body: { enabled: false, reason: "Copy is being rewritten" } });
    expect(templateSwitchBody(false, "")).toEqual({ ok: false, error: "Say why this email is being turned off." });
    expect(templateSwitchBody(false, "no")).toMatchObject({ ok: false });
    expect(templateSwitchBody(true, "")).toEqual({ ok: true, body: { enabled: true } });
    expect(templateSwitchBody(true, "Copy fixed")).toEqual({ ok: true, body: { enabled: true, reason: "Copy fixed" } });
    expect(templateSwitchBody(false, "x".repeat(281))).toMatchObject({ ok: false });
  });
});

describe("status line", () => {
  it("reads Sending when nothing holds the email back", () => {
    expect(emailStatusLine(row())).toEqual({ text: "Sending", tone: "success", skipping: false });
  });

  it("says who turned it off and why", () => {
    const off = row({ enabled: false, skipReason: "DISABLED_BY_ADMIN", disabledReason: "Rewriting", disabledBy: "a1" });
    expect(emailStatusLine(off, "Ada Obi")).toEqual({ text: "Off: Rewriting by Ada Obi", tone: "danger", skipping: true });
    expect(emailStatusLine(off).text).toBe("Off: Rewriting by an admin");
    expect(emailStatusLine(row({ enabled: false, skipReason: "DISABLED_BY_ADMIN" }), "Ada").text).toBe("Off: turned off by Ada");
  });

  it("names the pause holding it back", () => {
    expect(emailStatusLine(row({ marketing: true, skipReason: "PAUSED_MARKETING" }))).toEqual({ text: "Paused: marketing", tone: "warning", skipping: true });
    expect(emailStatusLine(row({ skipReason: "PAUSED_NON_ESSENTIAL" })).text).toBe("Paused: all non-essential");
  });

  it("handles push-only rows, an off row without a reason code, and unknown reasons", () => {
    expect(emailStatusLine(row({ emailChannel: false })).text).toBe("Not sent by email");
    expect(emailStatusLine(row({ enabled: false })).text).toBe("Off");
    expect(emailStatusLine(row({ skipReason: "QUOTA_REACHED" })).text).toBe("Held back: quota reached");
  });

  it("merges a gallery row with its control, falling back to the row's own fields", () => {
    const controls = [row({ key: "welcome", enabled: false, skipReason: "DISABLED_BY_ADMIN" })];
    expect(controlFor({ key: "welcome" }, controls).skipReason).toBe("DISABLED_BY_ADMIN");
    expect(controlFor({ key: "sign-in", enabled: true, essential: true, marketing: false }, controls)).toEqual({
      key: "sign-in",
      enabled: true,
      essential: true,
      essentialReason: null,
      marketing: false,
      skipReason: null,
    });
    expect(controlFor({ key: "x" }, undefined)).toMatchObject({ enabled: true, essential: false, marketing: false });
  });
});

describe("pause countdown", () => {
  const now = Date.UTC(2026, 10, 16, 12, 0, 0);
  const at = (ms: number) => new Date(now + ms).toISOString();

  it("counts down in the largest sensible units", () => {
    expect(pauseCountdown(at((2 * 60 + 5) * 60_000), now)).toBe("2h 05m");
    expect(pauseCountdown(at((3 * 24 + 4) * 3_600_000 + 59_000), now)).toBe("3d 4h");
    expect(pauseCountdown(at(4 * 60_000 + 9_000), now)).toBe("4:09");
    expect(pauseCountdown(at(1_000), now)).toBe("0:01");
  });

  it("is null when open-ended, past or unreadable", () => {
    expect(pauseCountdown(null, now)).toBeNull();
    expect(pauseCountdown(at(0), now)).toBeNull();
    expect(pauseCountdown(at(-60_000), now)).toBeNull();
    expect(pauseCountdown("not a date", now)).toBeNull();
  });

  it("treats a pause past its until as no longer in effect, even before the cron lifts it", () => {
    expect(pauseInEffect({ active: true, until: at(60_000) }, now)).toBe(true);
    expect(pauseInEffect({ active: true, until: null }, now)).toBe(true);
    expect(pauseInEffect({ active: true, until: at(-1) }, now)).toBe(false);
    expect(pauseInEffect({ active: false }, now)).toBe(false);
    expect(pauseInEffect(null, now)).toBe(false);
  });

  it("lists the pauses in effect, non-essential first, with banner copy and a per-pause dismiss key", () => {
    const controls = {
      pauseMarketing: { active: true, reason: "Reputation", until: null, setAt: "2026-11-16T10:00:00.000Z" },
      pauseNonEssential: { active: true, reason: "SMTP down", until: at(3_600_000), setAt: "2026-11-16T11:00:00.000Z" },
    };
    const pauses = activePauses(controls, now);
    expect(pauses.map((p) => p.kind)).toEqual(["nonEssential", "marketing"]);
    expect(pauseBannerText(pauses)).toBe("Non-essential emails are paused platform-wide.");
    expect(pauseBannerText(activePauses({ pauseMarketing: controls.pauseMarketing }, now))).toBe("Marketing emails are paused platform-wide.");
    expect(pauseBannerText([])).toBe("");
    expect(activePauses({ pauseMarketing: { active: false }, pauseNonEssential: { active: true, until: at(-1) } }, now)).toEqual([]);
    expect(pauseDismissKey("marketing", controls.pauseMarketing)).toBe("email-pause-dismissed:marketing:2026-11-16T10:00:00.000Z");
    expect(pauseDismissKey("marketing", controls.pauseMarketing)).not.toBe(pauseDismissKey("nonEssential", controls.pauseMarketing));
  });

  it("words who lifted the last pause", () => {
    expect(liftedByLabel("SYSTEM")).toBe("the scheduled lift");
    expect(liftedByLabel("a1", "Ada Obi")).toBe("Ada Obi");
    expect(liftedByLabel("a1")).toBe("an admin");
    expect(liftedByLabel(null)).toBe("");
  });
});

describe("quick picks and the custom time, in Lagos", () => {
  it("adds one or two hours", () => {
    const now = Date.UTC(2026, 10, 16, 12, 0, 0);
    expect(quickPickUntil("1h", now).toISOString()).toBe("2026-11-16T13:00:00.000Z");
    expect(quickPickUntil("2h", now).toISOString()).toBe("2026-11-16T14:00:00.000Z");
  });

  it("lands tomorrow 8 AM on the Lagos calendar (07:00 UTC)", () => {
    // 07:00 Lagos on the 16th: tomorrow is the 17th.
    expect(quickPickUntil("tomorrow8", Date.UTC(2026, 10, 16, 6, 0)).toISOString()).toBe("2026-11-17T07:00:00.000Z");
    // 23:30 Lagos on the 16th (22:30 UTC): still the 17th.
    expect(quickPickUntil("tomorrow8", Date.UTC(2026, 10, 16, 22, 30)).toISOString()).toBe("2026-11-17T07:00:00.000Z");
    // 00:30 Lagos on the 17th (23:30 UTC on the 16th): Lagos is already on the 17th, so the 18th.
    expect(quickPickUntil("tomorrow8", Date.UTC(2026, 10, 16, 23, 30)).toISOString()).toBe("2026-11-18T07:00:00.000Z");
    // Month and year roll over.
    expect(quickPickUntil("tomorrow8", Date.UTC(2026, 10, 30, 12, 0)).toISOString()).toBe("2026-12-01T07:00:00.000Z");
    expect(quickPickUntil("tomorrow8", Date.UTC(2026, 11, 31, 12, 0)).toISOString()).toBe("2027-01-01T07:00:00.000Z");
  });

  it("shows and reads the custom input as Lagos time, whatever the browser zone", () => {
    expect(lagosInputValue(new Date("2026-11-17T07:00:00.000Z"))).toBe("2026-11-17T08:00");
    expect(lagosInputValue(new Date("2026-11-16T23:30:00.000Z"))).toBe("2026-11-17T00:30");
    expect(parseLagosInput("2026-11-17T08:00")?.toISOString()).toBe("2026-11-17T07:00:00.000Z");
    expect(parseLagosInput("2026-11-17T00:30")?.toISOString()).toBe("2026-11-16T23:30:00.000Z");
    expect(parseLagosInput("2026-02-30T08:00")).toBeNull();
    expect(parseLagosInput("2026-11-17")).toBeNull();
    expect(parseLagosInput("")).toBeNull();
    expect(parseLagosInput(undefined)).toBeNull();
  });

  it("builds the pause body: reason required, until optional and in the future", () => {
    const now = Date.UTC(2026, 10, 16, 12, 0);
    expect(pauseBody({ reason: " SMTP reputation recovery " }, now)).toEqual({ ok: true, body: { active: true, reason: "SMTP reputation recovery" } });
    expect(pauseBody({ reason: "SMTP down", until: new Date(now + 3_600_000) }, now)).toEqual({
      ok: true,
      body: { active: true, reason: "SMTP down", until: "2026-11-16T13:00:00.000Z" },
    });
    expect(pauseBody({ reason: "" }, now)).toEqual({ ok: false, error: "Say why emails are being paused." });
    expect(pauseBody({ reason: "SMTP down", until: new Date(now - 1) }, now)).toEqual({ ok: false, error: "Pick a time in the future." });
    expect(pauseBody({ reason: "SMTP down", until: new Date(Number.NaN) }, now)).toMatchObject({ ok: false });
    expect(pauseBody({ reason: "x".repeat(281) }, now)).toMatchObject({ ok: false });
  });
});
