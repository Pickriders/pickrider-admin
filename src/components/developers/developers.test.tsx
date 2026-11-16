/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { DeveloperKey, DeveloperMonitoring } from "@/lib/admin/api";
import { orderSource } from "@/lib/admin/format";

import { DeveloperActionDialog, RevokeKeyDialog } from "./developer-actions";
import { healthChecks } from "./developer-monitoring";
import { availableActions, reasonProblem, waited } from "./developer-ui";
import { developersQuery } from "./developers-table";

const mutate = jest.fn();
jest.mock("@/lib/admin/hooks", () => ({ useAction: () => ({ mutate, isPending: false }) }));

describe("developer team rules on the client", () => {
  it("offers only the actions the backend allows from each state", () => {
    expect(availableActions({ status: "ACTIVE", liveStatus: "PENDING" })).toEqual(["approve", "reject", "suspendTeam"]);
    expect(availableActions({ status: "ACTIVE", liveStatus: "APPROVED" })).toEqual(["suspendLive", "suspendTeam"]);
    expect(availableActions({ status: "ACTIVE", liveStatus: "SUSPENDED" })).toEqual(["unsuspendLive", "suspendTeam"]);
    expect(availableActions({ status: "ACTIVE", liveStatus: "NOT_REQUESTED" })).toEqual(["suspendTeam"]);
    expect(availableActions({ status: "ACTIVE", liveStatus: "REJECTED" })).toEqual(["suspendTeam"]);
    // A suspended team can only be restored; its live access waits until then.
    expect(availableActions({ status: "SUSPENDED", liveStatus: "APPROVED" })).toEqual(["restoreTeam"]);
  });

  it("asks for a reason of 5 to 500 characters, as the API does", () => {
    expect(reasonProblem("  no ")).toMatch(/At least 5/);
    expect(reasonProblem("Add your website.")).toBeNull();
    expect(reasonProblem("x".repeat(501))).toMatch(/At most 500/);
  });

  it("says how long a team has waited for review", () => {
    const now = Date.parse("2026-11-16T12:00:00Z");
    expect(waited("2026-11-16T11:30:00Z", now)).toBe("under an hour");
    expect(waited("2026-11-16T07:00:00Z", now)).toBe("5 hours");
    expect(waited("2026-11-13T12:00:00Z", now)).toBe("3 days");
    expect(waited(null, now)).toBe("");
  });

  it("fixes the queue to pending teams and passes the All tab's filter", () => {
    const state = { page: 2, limit: 20, search: "acme", filters: { liveStatus: "APPROVED" } };
    expect(developersQuery("queue", state)).toEqual({ page: 2, limit: 20, search: "acme", liveStatus: "PENDING" });
    expect(developersQuery("all", state)).toEqual({ page: 2, limit: 20, search: "acme", liveStatus: "APPROVED" });
    expect(developersQuery("all", { ...state, filters: {} }).liveStatus).toBeUndefined();
  });

  it("tags Developer API orders as API", () => {
    expect(orderSource("DEVELOPER_API")).toBe("API");
    expect(orderSource(undefined)).toBe("APP");
  });
});

describe("monitoring health", () => {
  const thresholds = {
    windowMinutes: 5,
    minRequests: 20,
    errorRate: 0.05,
    p95Ms: 3000,
    rateLimitedRate: 0.2,
    minWebhookAttempts: 20,
    webhookFailureRate: 0.25,
    overdueDeliveries: 200,
  };
  const win = (patch = {}) => ({
    minutes: 5,
    requests: 100,
    errors: 1,
    errorRate: 0.01,
    rateLimited: 0,
    rateLimitedRate: 0,
    p95Ms: 400,
    webhookAttempts: 50,
    webhookFailures: 1,
    webhookFailureRate: 0.02,
    ...patch,
  });
  const monitoring = (now = win(), overdue = 0) =>
    ({
      at: "",
      now,
      lastHour: win(),
      last24Hours: win(),
      queue: { pending: 3, overdue, oldestOverdueSeconds: null },
      errorTeams: [],
      thresholds,
    }) as unknown as DeveloperMonitoring;
  const states = (m: DeveloperMonitoring) => Object.fromEntries(healthChecks(m).map((c) => [c.id, c.state]));

  it("applies the same limits as the alert check", () => {
    expect(states(monitoring())).toEqual({
      errors: "ok",
      latency: "ok",
      rateLimited: "ok",
      webhooks: "ok",
      backlog: "ok",
    });
    expect(states(monitoring(win({ errorRate: 0.05, p95Ms: 3200 }), 250))).toEqual({
      errors: "breached",
      latency: "breached",
      rateLimited: "ok",
      webhooks: "ok",
      backlog: "breached",
    });
  });

  it("stays quiet on too little traffic to judge", () => {
    expect(states(monitoring(win({ requests: 5, errorRate: 0.6, webhookAttempts: 3, webhookFailureRate: 1 })))).toEqual(
      expect.objectContaining({ errors: "quiet", latency: "quiet", webhooks: "quiet" }),
    );
  });
});

describe("staff action dialogs", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });
  beforeEach(() => {
    mutate.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const button = (label: string) =>
    [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === label) as HTMLButtonElement;
  const type = (value: string) => {
    const box = document.querySelector("textarea") as HTMLTextAreaElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    act(() => {
      setter?.call(box, value);
      box.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  it("won't reject a request until the developer is told what to fix", () => {
    act(() =>
      root.render(
        <DeveloperActionDialog action="reject" team={{ id: "t1", name: "Acme" }} onClose={() => undefined} />,
      ),
    );

    expect(document.body.textContent).toContain("Reject Acme's request?");
    expect(button("Reject request").disabled).toBe(true);
    type("Add your company website.");
    expect(button("Reject request").disabled).toBe(false);
    act(() => button("Reject request").click());

    expect(mutate).toHaveBeenCalledWith({ action: "reject", reason: "Add your company website." });
  });

  it("approves without a reason", () => {
    act(() =>
      root.render(
        <DeveloperActionDialog action="approve" team={{ id: "t1", name: "Acme" }} onClose={() => undefined} />,
      ),
    );

    expect(document.querySelector("textarea")).toBeNull();
    act(() => button("Approve").click());
    expect(mutate).toHaveBeenCalledWith({ action: "approve", reason: "" });
  });

  it("revokes one key with a reason, naming its prefix and never more of it", () => {
    const apiKey = {
      id: "k1",
      label: "Server",
      prefix: "sk_live_ab12",
      livemode: true,
      status: "active",
      scopes: [],
    } as unknown as DeveloperKey;
    act(() => root.render(<RevokeKeyDialog teamId="t1" apiKey={apiKey} onClose={() => undefined} />));

    expect(document.body.textContent).toContain("Revoke Server?");
    expect(document.body.textContent).toContain("sk_live_ab12…");
    type("Posted in a public repository.");
    act(() => button("Revoke key").click());
    expect(mutate).toHaveBeenCalledWith({ keyId: "k1", reason: "Posted in a public repository." });
  });
});
