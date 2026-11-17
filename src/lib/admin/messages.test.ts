import type { TableState } from "./url-state";
import {
  MESSAGE_FILTER_KEYS,
  channelCounts,
  failureRate,
  label,
  lagosDayEnd,
  lagosDayStart,
  messageHeadline,
  messagesQuery,
  messagesRange,
  shortProviderId,
  termiiBalanceLabel,
  skipLine,
  MESSAGE_STATUS_LABEL,
  MESSAGE_STATUS_TONE,
} from "./messages";

const state = (patch: Partial<TableState> = {}): TableState => ({ page: 1, limit: 20, filters: {}, ...patch });

describe("Lagos day boundaries", () => {
  it("maps a Lagos calendar day to UTC instants (Lagos is UTC+1, no daylight saving)", () => {
    expect(lagosDayStart("2026-11-14")).toBe("2026-11-13T23:00:00.000Z");
    expect(lagosDayEnd("2026-11-14")).toBe("2026-11-14T22:59:59.999Z");
    // Midsummer too: no DST shift.
    expect(lagosDayStart("2026-07-01")).toBe("2026-06-30T23:00:00.000Z");
  });

  it("ignores anything that is not a YYYY-MM-DD day", () => {
    expect(lagosDayStart(undefined)).toBeUndefined();
    expect(lagosDayStart("")).toBeUndefined();
    expect(lagosDayStart("14/11/2026")).toBeUndefined();
    expect(lagosDayEnd("2026-13-45")).toBeUndefined();
    expect(lagosDayEnd(null)).toBeUndefined();
  });

  it("turns the URL range into the core's dateFrom / dateTo, either end optional", () => {
    expect(messagesRange({})).toEqual({});
    expect(messagesRange({ from: "2026-11-01" })).toEqual({ dateFrom: "2026-10-31T23:00:00.000Z" });
    expect(messagesRange({ to: "2026-11-14" })).toEqual({ dateTo: "2026-11-14T22:59:59.999Z" });
    expect(messagesRange({ from: "2026-11-01", to: "2026-11-14" })).toEqual({
      dateFrom: "2026-10-31T23:00:00.000Z",
      dateTo: "2026-11-14T22:59:59.999Z",
    });
  });
});

describe("messagesQuery", () => {
  it("sends page and limit, and nothing else when no filter is set", () => {
    expect(messagesQuery(state())).toEqual({ page: 1, limit: 20 });
  });

  it("maps the search box to the recipient search and passes the known filters", () => {
    const query = messagesQuery(
      state({
        page: 3,
        limit: 50,
        search: " 0803 123 ",
        filters: {
          channel: "SMS",
          status: "FAILED",
          provider: "TERMII",
          purpose: "SECURITY",
          template: "verification-code",
          userId: "u1",
          orderId: "o1",
        },
      }),
    );
    expect(query).toEqual({
      page: 3,
      limit: 50,
      recipient: "0803 123",
      channel: "SMS",
      status: "FAILED",
      provider: "TERMII",
      purpose: "SECURITY",
      template: "verification-code",
      userId: "u1",
      orderId: "o1",
    });
  });

  it("keeps the drawer id, the tab, sorting and blank values out of the request", () => {
    const query = messagesQuery(
      state({
        sortBy: "createdAt",
        order: "ASC",
        search: "   ",
        filters: { id: "m1", tab: "x", channel: " ", status: "SENT" },
      }),
    );
    expect(query).toEqual({ page: 1, limit: 20, status: "SENT" });
  });

  it("caps the page size at the core's maximum and adds the date range", () => {
    expect(messagesQuery(state({ limit: 500, from: "2026-11-14", to: "2026-11-14" }))).toEqual({
      page: 1,
      limit: 100,
      dateFrom: "2026-11-13T23:00:00.000Z",
      dateTo: "2026-11-14T22:59:59.999Z",
    });
  });

  it("only knows the filters the endpoint reads", () => {
    expect([...MESSAGE_FILTER_KEYS].sort()).toEqual([
      "channel",
      "orderId",
      "provider",
      "purpose",
      "skipReason",
      "status",
      "template",
      "userId",
    ]);
  });
});

describe("summary helpers", () => {
  const byChannel = [
    { channel: "EMAIL", queued: 2, sent: 90, failed: 10, skipped: 5, total: 107 },
    { channel: "SMS", queued: 0, sent: 40, failed: 0, total: 40 },
  ];

  it("picks one channel's counts, zeros when it had nothing", () => {
    expect(channelCounts(byChannel, "EMAIL")).toEqual({ queued: 2, sent: 90, failed: 10, skipped: 5, total: 107 });
    // An older core without `skipped` reads as zero skipped.
    expect(channelCounts(byChannel, "SMS")).toEqual({ queued: 0, sent: 40, failed: 0, skipped: 0, total: 40 });
    expect(channelCounts([byChannel[0]], "SMS")).toEqual({ queued: 0, sent: 0, failed: 0, skipped: 0, total: 0 });
    expect(channelCounts(undefined, "SMS")).toEqual({ queued: 0, sent: 0, failed: 0, skipped: 0, total: 0 });
  });

  it("gives the failure rate of finished sends, or null when none finished", () => {
    expect(failureRate({ sent: 90, failed: 10 })).toBe(10);
    expect(failureRate({ sent: 2, failed: 1 })).toBe(33);
    expect(failureRate({ sent: 0, failed: 0 })).toBeNull();
  });

  it("shows the Termii balance in the provider's own units, as currency when it can", () => {
    expect(termiiBalanceLabel({ balance: 2340.5, currency: "NGN" })).toBe("₦2,340.50");
    expect(termiiBalanceLabel({ balance: 120, currency: "units" })).toBe("120 units");
    expect(termiiBalanceLabel({ balance: 1500 })).toBe("1,500");
    expect(termiiBalanceLabel(null)).toBe("");
    expect(termiiBalanceLabel({ balance: Number.NaN })).toBe("");
  });
});

describe("row helpers", () => {
  it("labels known values and passes unknown ones through", () => {
    expect(label(MESSAGE_STATUS_LABEL, "FAILED")).toBe("Failed");
    expect(label(MESSAGE_STATUS_LABEL, "BOUNCED")).toBe("BOUNCED");
    expect(label(MESSAGE_STATUS_LABEL, undefined)).toBe("");
    expect(label(MESSAGE_STATUS_LABEL, "SKIPPED")).toBe("Skipped");
    expect(MESSAGE_STATUS_TONE.SKIPPED).toBe("neutral");
  });

  it("says why a skipped message was held back, and nothing for any other status", () => {
    expect(skipLine({ status: "SKIPPED", skipReason: "PAUSED_MARKETING" })).toBe("Held back: marketing emails paused");
    expect(skipLine({ status: "SKIPPED", skipReason: "DISABLED_BY_ADMIN" })).toBe("Held back: turned off by an admin");
    expect(skipLine({ status: "SKIPPED", skipReason: "PAUSED_NON_ESSENTIAL" })).toBe(
      "Held back: non-essential emails paused",
    );
    expect(skipLine({ status: "SKIPPED" })).toBe("Held back by the email controls");
    expect(skipLine({ status: "SKIPPED", skipReason: "SOMETHING_NEW" })).toBe("Held back: something new");
    expect(skipLine({ status: "SENT", skipReason: "PAUSED_MARKETING" })).toBe("");
  });

  it("puts the skip reason in the list query only when set", () => {
    expect(messagesQuery(state({ filters: { status: "SKIPPED", skipReason: "DISABLED_BY_ADMIN" } }))).toEqual({
      page: 1,
      limit: 20,
      status: "SKIPPED",
      skipReason: "DISABLED_BY_ADMIN",
    });
    expect(messagesQuery(state({ filters: { skipReason: " " } }))).not.toHaveProperty("skipReason");
  });

  it("shows the subject, else the body preview, else nothing", () => {
    expect(messageHeadline({ subject: "Your code", bodyPreview: "Use ••••••" })).toBe("Your code");
    expect(messageHeadline({ subject: " ", bodyPreview: "Use ••••••" })).toBe("Use ••••••");
    expect(messageHeadline({})).toBe("");
  });

  it("shortens long provider ids and strips SMTP angle brackets", () => {
    expect(shortProviderId("3017123456789")).toBe("3017123456789");
    expect(shortProviderId("<a1b2c3d4e5f6g7h8i9@mail.pickriders.com>")).toBe("a1b2c3d4e5…rs.com");
    expect(shortProviderId(undefined)).toBe("");
  });
});
