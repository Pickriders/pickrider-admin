/**
 * @jest-environment jsdom
 */
import { toast } from "sonner";

import { playUrgentChime } from "@/lib/admin/chime";
import type { AdminAlert } from "@/lib/admin/api";

import { alertToastId, bellBadge, showAlertToast } from "./alert-bell";
import { ALERT_TYPE_OPTIONS, alertEmailMeta, alertHref, alertTypeLabel, digestTitle, findAlert, riderUnpauseHref } from "./alert-ui";

jest.mock("sonner", () => ({ toast: { error: jest.fn(), warning: jest.fn(), success: jest.fn(), dismiss: jest.fn() } }));
jest.mock("@/lib/admin/chime", () => ({ playUrgentChime: jest.fn(() => true) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));

const alert = (patch: Partial<AdminAlert> = {}): AdminAlert =>
  ({
    id: "a1",
    type: "HANDOFF_NO_RIDER",
    severity: "HIGH",
    status: "OPEN",
    title: "Nobody is taking a handoff",
    message: "Nobody has taken Ada Obi's handoff on order #1042 after 6 minutes.",
    occurrences: 1,
    orderId: "o1",
    orderNumber: "1042",
    createdAt: "2026-11-10T09:00:00.000Z",
    ...patch,
  }) as AdminAlert;

describe("alert bell badge", () => {
  it("shows unclaimed alerts only, red when one is urgent", () => {
    expect(bellBadge(undefined)).toBeNull();
    expect(bellBadge({ open: 0, urgent: 0, claimed: 3 })).toBeNull();
    expect(bellBadge({ open: 2, urgent: 0, claimed: 0 })).toEqual({ label: "2", urgent: false });
    expect(bellBadge({ open: 1, urgent: 1, claimed: 0 })).toEqual({ label: "1", urgent: true });
    expect(bellBadge({ open: 120, urgent: 0, claimed: 0 })?.label).toBe("99+");
  });
});

describe("alert copy", () => {
  it("digests a burst into one sentence per type", () => {
    expect(digestTitle("HANDOFF_NO_RIDER", 15)).toBe("15 handoffs waiting for a rider");
    expect(digestTitle("HANDOFF_NO_RIDER", 1)).toBe("1 handoff waiting for a rider");
    expect(digestTitle("HANDOFF_ACCIDENT", 6)).toBe("6 accidents reported by riders");
    expect(digestTitle("SOMETHING_NEW", 7)).toBe("7 new something new alerts");
  });

  it("labels known types and keeps unknown ones readable", () => {
    expect(alertTypeLabel("HANDOFF_CODE_LOCKOUT")).toBe("Handoff code lockout");
    expect(alertTypeLabel("RELEASE_STORM")).toBe("Release storm");
  });

  it("labels the rider release alerts and offers them on the Alerts page filter", () => {
    expect(alertTypeLabel("RIDER_FREQUENT_RELEASES")).toBe("Frequent releases");
    expect(alertTypeLabel("RIDER_AUTO_PAUSED")).toBe("Rider paused");
    expect(ALERT_TYPE_OPTIONS).toEqual(
      expect.arrayContaining([
        { value: "RIDER_FREQUENT_RELEASES", label: "Frequent releases" },
        { value: "RIDER_AUTO_PAUSED", label: "Rider paused" },
      ]),
    );
    expect(digestTitle("RIDER_FREQUENT_RELEASES", 3)).toBe("3 riders releasing orders often");
    expect(digestTitle("RIDER_AUTO_PAUSED", 1)).toBe("1 rider paused for too many releases");
  });

  it("links a paused rider alert to the rider page with the resume dialog, and nothing else", () => {
    expect(riderUnpauseHref({ type: "RIDER_AUTO_PAUSED", riderId: "r1" })).toBe("/couriers/r1/details?resume=dispatch");
    expect(riderUnpauseHref({ type: "RIDER_AUTO_PAUSED" })).toBeNull();
    expect(riderUnpauseHref({ type: "RIDER_FREQUENT_RELEASES", riderId: "r1" })).toBeNull();
  });
});

describe("alert emails", () => {
  it("shows nothing when no email went out", () => {
    expect(alertEmailMeta(alert())).toEqual([]);
    expect(alertEmailMeta(alert({ escalatedAt: "2026-11-10T09:02:00.000Z" }))).toEqual([]);
  });

  it("lists the escalation, digest, reminder and resolved follow-up in that order, with the Lagos time", () => {
    const meta = alertEmailMeta(
      alert({
        emailedAt: "2026-11-10T09:42:00.000Z",
        emailRecipientsCount: 2,
        emailReminderAt: "2026-11-10T09:50:00.000Z",
        emailResolvedAt: "2026-11-10T10:05:00.000Z",
        emailDigestAt: "2026-11-10T09:45:00.000Z",
      }),
    );
    expect(meta.map((m) => m.key)).toEqual(["emailed", "digest", "reminder", "resolved"]);
    expect(meta[0].label).toMatch(/^Emailed support at 10:42/);
    expect(meta[0].title).toMatch(/^Emailed 2 support inboxes at /);
    expect(meta.slice(1).map((m) => m.label)).toEqual(["In digest", "Reminder sent", "Resolved email sent"]);
  });

  it("a digest-only alert says In digest and nothing else", () => {
    expect(alertEmailMeta(alert({ emailDigestAt: "2026-11-10T09:45:00.000Z" })).map((m) => m.label)).toEqual(["In digest"]);
  });

  it("one inbox reads singular", () => {
    expect(alertEmailMeta(alert({ emailedAt: "2026-11-10T09:42:00.000Z", emailRecipientsCount: 1 }))[0].title).toMatch(/^Emailed 1 support inbox at /);
  });
});

describe("linked alert", () => {
  it("builds the link the support emails and toasts open", () => {
    expect(alertHref("a1")).toBe("/alerts?alert=a1");
    expect(alertHref("a b")).toBe("/alerts?alert=a%20b");
  });

  it("finds the alert in the first list that has it", () => {
    const a = alert({ id: "a1" });
    const b = alert({ id: "b2" });
    expect(findAlert(undefined, [a])).toBeUndefined();
    expect(findAlert("b2", [a], undefined, [b])).toBe(b);
    expect(findAlert("a1", [a], [alert({ id: "a1", title: "older copy" })])).toBe(a);
    expect(findAlert("zz", [a], [b])).toBeUndefined();
  });
});

describe("alert toasts", () => {
  const handlers = { onClaim: jest.fn(), onOpen: jest.fn() };

  it("an URGENT alert chimes and stays until claimed or closed", () => {
    showAlertToast(alert({ severity: "URGENT" as AdminAlert["severity"], type: "HANDOFF_ACCIDENT", title: "Rider reported an accident" }), handlers);
    expect(playUrgentChime).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    const [title, options] = (toast.error as jest.Mock).mock.calls[0];
    expect(title).toBe("Rider reported an accident");
    expect(options.id).toBe(alertToastId("a1"));
    expect(options.duration).toBe(Infinity);
    options.action.onClick();
    expect(handlers.onClaim).toHaveBeenCalledWith("a1");
  });

  it("a HIGH alert is a quiet warning that times out, without repeating the order number", () => {
    showAlertToast(alert(), handlers);
    expect(playUrgentChime).not.toHaveBeenCalled();
    const [, options] = (toast.warning as jest.Mock).mock.calls[0];
    expect(options.duration).toBe(12_000);
    expect(options.description).toBe("Nobody has taken Ada Obi's handoff on order #1042 after 6 minutes.");
    options.cancel.onClick();
    expect(handlers.onOpen).toHaveBeenCalled();
  });

  it("adds the order number when the message does not mention it", () => {
    showAlertToast(alert({ message: "Five wrong codes. The swap is locked for 10 minutes." }), handlers);
    const [, options] = (toast.warning as jest.Mock).mock.calls[0];
    expect(options.description).toBe("Five wrong codes. The swap is locked for 10 minutes. · Order #1042");
  });
});
