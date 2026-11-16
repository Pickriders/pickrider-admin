/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { DeveloperActivity, DeveloperDetail, DeveloperKey, DeveloperModeStats } from "@/lib/admin/api";

import { roleLabel, sortKeys, TeamKeys } from "./team-access";
import { activityActor, activitySentence, ActivityItem, groupByDay } from "./team-activity";
import { TeamHeader, teamNotice } from "./team-header";
import { liveJourney } from "./team-overview";
import { defaultMode } from "./team-page";
import { duration, requestLogQuery } from "./team-requests";
import { prettyJson, statusTone } from "./team-shared";
import { purposeLabel } from "./team-wallet";
import { endpointHealth } from "./team-webhooks";

jest.mock("@/lib/admin/hooks", () => ({ useAction: () => ({ mutate: jest.fn(), isPending: false }) }));
let allowed = true;
jest.mock("@/lib/admin/use-can", () => ({ useCan: () => ({ can: () => allowed, roles: [], ready: true }) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }), usePathname: () => "/developers/t1", useSearchParams: () => new URLSearchParams() }));

const mode = (patch: Partial<DeveloperModeStats> = {}): DeveloperModeStats =>
  ({
    wallet: null,
    orders: { total: 0, last30Days: 0, active: 0, delivered: 0, cancelled: 0 },
    webhooks: { endpoints: 0, healthy: 0, failing: 0, disabled: 0 },
    requests30d: 0,
    errors30d: 0,
    lastRequestAt: null,
    ...patch,
  }) as DeveloperModeStats;

const key = (patch: Partial<DeveloperKey> = {}): DeveloperKey =>
  ({ id: "k1", label: "Server", prefix: "sk_test_4fQ9", livemode: false, status: "active", scopes: [], lastUsedAt: null, expiresAt: null, revokedAt: null, revokedReason: null, createdAt: "2026-11-01T09:00:00Z", ...patch }) as DeveloperKey;

const team = (patch: Partial<DeveloperDetail> = {}): DeveloperDetail =>
  ({
    id: "t1",
    name: "Acme Logistics",
    handle: "acme",
    companyName: "Acme Ltd",
    status: "ACTIVE",
    liveStatus: "PENDING",
    liveRequestedAt: "2026-11-14T09:00:00Z",
    liveReviewedAt: null,
    owner: { id: "u1", name: "Ada Obi", email: "ada@acme.test", phone: null, emailVerified: true, phoneVerified: false },
    suspensionReason: null,
    suspendedAt: null,
    createdAt: "2026-11-01T09:00:00Z",
    website: "https://acme.test",
    supportEmail: "help@acme.test",
    supportPhone: null,
    useCase: "Same-day deliveries for our online shop in Lagos.",
    expectedMonthlyVolume: "UP_TO_1000",
    liveRejectionReason: null,
    liveSuspensionReason: null,
    liveReviewedBy: null,
    memberCount: 1,
    members: [],
    keys: [key()],
    test: mode({ requests30d: 12 }),
    live: mode(),
    suspendedBy: null,
    settings: {
      description: null,
      logo: null,
      notificationEmails: [],
      lowBalanceThreshold: null,
      lowBalanceAlertedAt: null,
      allowedIps: [],
      autoTopUp: { enabled: false, threshold: null, amount: null, card: null, lastChargeAt: null, consecutiveFailures: 0, lastFailureReason: null, disabledReason: null },
      fundingAccount: null,
    },
    invitations: [],
    updatedAt: null,
    ...patch,
  }) as DeveloperDetail;

const activity = (patch: Partial<DeveloperActivity> = {}): DeveloperActivity =>
  ({ id: "a1", event: "key.revoked", actor: null, staff: null, target: { type: "api_key", label: "Server" }, before: null, after: null, createdAt: "2026-11-15T10:00:00Z", ...patch }) as DeveloperActivity;

describe("developer team page rules", () => {
  it("opens live once a team has been live, test before", () => {
    expect(defaultMode({ liveStatus: "APPROVED" })).toBe("live");
    expect(defaultMode({ liveStatus: "SUSPENDED" })).toBe("live");
    expect(defaultMode({ liveStatus: "PENDING" })).toBe("test");
    expect(defaultMode({ liveStatus: "NOT_REQUESTED" })).toBe("test");
  });

  it("says why a team is held back, team suspension first", () => {
    expect(teamNotice(team())).toBeNull();
    expect(teamNotice(team({ liveStatus: "REJECTED", liveRejectionReason: "Add a website.", liveReviewedBy: { id: "s1", name: "Ola" } }))).toMatchObject({ title: "Live request rejected", body: "Add a website.", by: "Ola" });
    expect(teamNotice(team({ liveStatus: "SUSPENDED", status: "SUSPENDED", suspensionReason: "Fraud.", suspendedBy: { id: "s2", name: "Bisi" } }))).toMatchObject({ title: "Team suspended", body: "Fraud.", by: "Bisi" });
  });

  it("draws the road to live, with who decided", () => {
    expect(liveJourney(team({ liveStatus: "NOT_REQUESTED", liveRequestedAt: null })).map((s) => [s.label, s.state])).toEqual([
      ["Signed up", "done"],
      ["Hasn't asked to go live", "todo"],
    ]);
    expect(liveJourney(team()).map((s) => s.state)).toEqual(["done", "done", "current"]);
    const approved = liveJourney(team({ liveStatus: "APPROVED", liveReviewedBy: { id: "s1", name: "Ola Obi" }, liveReviewedAt: "2026-11-15T10:00:00Z" }));
    expect(approved[2]).toMatchObject({ label: "Approved by Ola Obi", state: "done" });
    const suspended = liveJourney(team({ liveStatus: "SUSPENDED", liveSuspensionReason: "Chargebacks." }));
    expect(suspended.map((s) => s.label)).toEqual(["Signed up", "Asked to go live", "Approved", "Live access suspended"]);
  });

  it("puts activity in words, naming staff only as staff", () => {
    expect(activitySentence(activity())).toBe("revoked the key Server");
    expect(activitySentence(activity({ event: "live.approved", target: null }))).toBe("approved live access");
    expect(activitySentence(activity({ event: "wallet.something_new", target: null }))).toBe("wallet something new");
    expect(activityActor(activity({ actor: { id: "u1", name: "Ada Obi", email: "ada@acme.test" } }))).toEqual({ name: "Ada Obi", staff: false });
    expect(activityActor(activity({ staff: { id: "s1", name: "Ola Obi" } }))).toEqual({ name: "Ola Obi", staff: true });
    expect(activityActor(activity())).toEqual({ name: "Pickriders", staff: false });
  });

  it("groups activity by day, keeping order", () => {
    const rows = [activity({ id: "1", createdAt: "2026-11-15T18:00:00Z" }), activity({ id: "2", createdAt: "2026-11-15T09:00:00Z" }), activity({ id: "3", createdAt: "2026-11-13T09:00:00Z" })];
    expect(groupByDay(rows).map((g) => g.rows.map((r) => r.id))).toEqual([["1", "2"], ["3"]]);
  });

  it("looks a request up by id in either mode, or filters within the page's mode", () => {
    const filters = { status: "failed", method: "POST", path: " /orders ", key: "", requestId: "" };
    expect(requestLogQuery("live", filters)).toEqual({ livemode: "true", status: "failed", method: "POST", path: "/orders", key: "" });
    expect(requestLogQuery("test", { ...filters, requestId: " req_123 " })).toEqual({ request_id: "req_123" });
    expect(duration(312.4)).toBe("312 ms");
    expect(duration(2400)).toBe("2.4 s");
  });

  it("colours statuses and reads endpoint health", () => {
    expect([200, 302, 404, 503, null].map(statusTone)).toEqual(["success", "info", "warning", "danger", "neutral"]);
    expect(endpointHealth({ status: "enabled", disabled_reason: null, failing_since: null }).label).toBe("Delivering");
    expect(endpointHealth({ status: "enabled", disabled_reason: null, failing_since: "2026-11-14T09:00:00Z" }).tone).toBe("danger");
    expect(endpointHealth({ status: "disabled", disabled_reason: "failing", failing_since: null }).label).toBe("Turned off: kept failing");
  });

  it("formats keys, roles, purposes and bodies", () => {
    const { working, old } = sortKeys([key({ id: "a", status: "revoked" }), key({ id: "b" }), key({ id: "c", status: "expiring" })]);
    expect([working.map((k) => k.id), old.map((k) => k.id)]).toEqual([["b", "c"], ["a"]]);
    expect(roleLabel("TEAM_DEVELOPER")).toBe("Developer");
    expect(purposeLabel("order_payment")).toBe("Order payment");
    expect(prettyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(prettyJson("not json")).toBe("not json");
    expect(prettyJson(null)).toBe("");
  });
});

describe("developer team page", () => {
  let container: HTMLDivElement;
  let root: Root;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeEach(() => {
    allowed = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const buttons = () => Array.from(container.querySelectorAll("button")).map((b) => b.textContent?.trim());

  it("shows a pending team's request with the reviewer's checklist and the review actions", () => {
    act(() => root.render(<TeamHeader team={team()} />));
    expect(container.textContent).toContain("Asking to go live");
    expect(container.textContent).toContain("Same-day deliveries for our online shop");
    expect(container.textContent).toContain("Owner's email verified");
    expect(buttons()).toEqual(expect.arrayContaining(["Approve live access", "Reject"]));
  });

  it("hides the actions from staff who can only look", () => {
    allowed = false;
    act(() => root.render(<TeamHeader team={team()} />));
    expect(buttons()).not.toContain("Approve live access");
    expect(container.textContent).toContain("Acme Logistics");
  });

  it("shows a suspended team's notice with who suspended it, and only Restore", () => {
    act(() => root.render(<TeamHeader team={team({ status: "SUSPENDED", suspensionReason: "Suspected fraud.", suspendedAt: "2026-11-15T10:00:00Z", suspendedBy: { id: "s1", name: "Ola Obi" } })} />));
    expect(container.querySelector("[role='status']")?.textContent).toContain("by Ola Obi");
    expect(container.textContent).toContain("Suspected fraud.");
    expect(buttons()).toContain("Restore team");
    expect(container.textContent).not.toContain("Asking to go live");
  });

  it("badges staff actions and shows the reason the developer was given", () => {
    act(() => root.render(<ol><ActivityItem row={activity({ event: "team.suspended", target: null, staff: { id: "s1", name: "Ola Obi" }, after: { status: "SUSPENDED", reason: "Suspected fraud." } })} /></ol>));
    expect(container.textContent).toContain("Ola Obi");
    expect(container.textContent).toContain("Staff");
    expect(container.textContent).toContain("suspended the team");
    expect(container.textContent).toContain("“Suspected fraud.”");
  });

  it("lists the mode's working keys with revoke, and old ones on request", () => {
    const keys = [key({ id: "w", label: "Server" }), key({ id: "r", label: "Old laptop", status: "revoked", revokedAt: "2026-11-10T09:00:00Z", revokedReason: "Leaked." }), key({ id: "l", label: "Live server", livemode: true })];
    act(() => root.render(<TeamKeys team={team({ keys })} mode="test" />));
    expect(container.textContent).toContain("Server");
    expect(container.textContent).not.toContain("Old laptop");
    expect(container.textContent).not.toContain("Live server");
    expect(buttons().filter((b) => b === "Revoke")).toHaveLength(1);

    const show = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Show old keys")!;
    act(() => show.click());
    expect(container.textContent).toContain("Old laptop");
    expect(container.textContent).toContain("“Leaked.”");
  });
});
