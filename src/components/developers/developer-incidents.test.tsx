/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { DeveloperIncident } from "@/lib/admin/api";
import { can } from "@/lib/admin-access";

import { DeveloperIncidentsPanel, incidentProblem } from "./developer-incidents";

let incidents: DeveloperIncident[] = [];
let allowed = true;
jest.mock("@/lib/admin/hooks", () => ({
  useAction: () => ({ mutate: jest.fn(), isPending: false }),
  useDeveloperIncidents: () => ({ data: { data: incidents }, isLoading: false, isError: false }),
}));
jest.mock("@/lib/admin/use-can", () => ({ useCan: () => ({ can: () => allowed, roles: [], ready: true }) }));

const incident = (patch: Partial<DeveloperIncident> = {}): DeveloperIncident =>
  ({
    id: "inc_1",
    record_id: "1",
    title: "Slow order creation",
    status: "investigating",
    impact: "major",
    components: ["api"],
    started_at: "2026-11-17T10:00:00.000Z",
    resolved_at: null,
    updates: [{ status: "investigating", message: "Looking into it.", at: "2026-11-17T10:00:00.000Z" }],
    ...patch,
  }) as DeveloperIncident;

describe("incident rules", () => {
  it("asks for a title, a part and a message the API will take", () => {
    expect(incidentProblem({ title: "x", components: ["api"], message: "Long enough message." })).toMatch(/title/);
    expect(incidentProblem({ title: "Slow orders", components: [], message: "Long enough message." })).toMatch(/part/);
    expect(incidentProblem({ title: "Slow orders", components: ["api"], message: "short" })).toMatch(/at least 10/);
    expect(incidentProblem({ title: "Slow orders", components: ["api"], message: "Long enough message." })).toBeNull();
    expect(incidentProblem({ message: "Back to normal now." })).toBeNull();
  });

  it("lets operations post incidents, and finance only look", () => {
    expect(can("incident.manage", ["PLATFORM_OPERATION"])).toBe(true);
    expect(can("incident.manage", ["PLATFORM_FINANCE"])).toBe(false);
  });
});

describe("the Status tab", () => {
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

  it("shows open incidents with Post update, and resolved ones without", () => {
    incidents = [
      incident(),
      incident({
        record_id: "2",
        title: "Webhooks delayed",
        status: "resolved",
        resolved_at: "2026-11-16T11:00:00.000Z",
      }),
    ];
    act(() => root.render(<DeveloperIncidentsPanel />));
    expect(container.textContent).toContain("Slow order creation");
    expect(container.textContent).toContain("Webhooks delayed");
    expect(buttons().filter((b) => b === "Post update")).toHaveLength(1);
    expect(buttons()).toContain("Open incident");
  });

  it("says when nothing is open, and hides the controls from roles that can't post", () => {
    incidents = [];
    allowed = false;
    act(() => root.render(<DeveloperIncidentsPanel />));
    expect(container.textContent).toContain("No open incidents");
    expect(buttons()).not.toContain("Open incident");
  });
});
