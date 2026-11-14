/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { canStartHandoff } from "@/app/(dashboard)/orders/[id]/_components/handoff-panel";
import type { Handoff, OrderRow } from "@/lib/admin/api";

import { HandoffActions } from "./handoff-actions";
import { FlagChips, SplitCell, isLive, needsReview } from "./handoff-ui";
import { LIVE_STATUS, bulkSummary, handoffsQuery } from "./handoffs-table";

const mutate = jest.fn();
jest.mock("@/lib/admin/hooks", () => ({
  useAction: () => ({ mutate, isPending: false }),
  useHandoffs: () => ({ data: undefined, isLoading: false }),
  useUsers: () => ({ data: undefined, isLoading: false }),
}));
let allowed = true;
jest.mock("@/lib/admin/use-can", () => ({ useCan: () => ({ can: () => allowed, roles: [], ready: true }) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }), usePathname: () => "/handoffs", useSearchParams: () => new URLSearchParams() }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, prefetch: _prefetch, ...rest }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const rider = (id: string, firstname: string) => ({ id, firstname, lastname: "Rider", phone: "2348000000000" });
const handoff = (patch: Partial<Handoff> = {}): Handoff =>
  ({
    id: "h1",
    orderId: "o1",
    orderNumber: "1042",
    sequence: 1,
    status: "SEARCHING",
    reason: "BIKE_PROBLEM",
    initiatedBy: "RIDER",
    fromRider: rider("a", "Ada"),
    searchRadiusKm: 3,
    rungCount: 4,
    declinedCount: 0,
    droppedRiderIds: [],
    createdAt: "2026-11-10T09:00:00.000Z",
    failedAttempts: 0,
    bonusAmount: 30000,
    bonusStatus: "PENDING",
    flags: [],
    counted: false,
    ...patch,
  }) as Handoff;

describe("handoff rules on the client", () => {
  it("knows which handoffs are live and which wait for review", () => {
    expect(isLive(handoff({ status: "AWAITING_SUPPORT" as Handoff["status"] }))).toBe(true);
    expect(isLive(handoff({ status: "COMPLETED" as Handoff["status"] }))).toBe(false);
    expect(needsReview(handoff({ status: "COMPLETED" as Handoff["status"], countDecision: "PENDING_REVIEW" as Handoff["countDecision"] }))).toBe(true);
    expect(needsReview(handoff({ status: "COMPLETED" as Handoff["status"], countDecision: "RULE_WAIVED" as Handoff["countDecision"], bonusStatus: "HELD" as Handoff["bonusStatus"] }))).toBe(true);
    expect(needsReview(handoff({ status: "COMPLETED" as Handoff["status"], countDecision: "COUNTED" as Handoff["countDecision"], bonusStatus: "PAID" as Handoff["bonusStatus"] }))).toBe(false);
    // A live one with a pending decision is not reviewable until the swap completes.
    expect(needsReview(handoff({ countDecision: "PENDING_REVIEW" as Handoff["countDecision"] }))).toBe(false);
  });

  it("offers Start handoff only on a picked-up order on the way with no live handoff", () => {
    const order = {
      status: "ON_GOING",
      rider: { _id: "a", firstname: "Ada" },
      locations: [
        { _id: "p", type: "PICKUP", status: "COMPLETED" },
        { _id: "d", type: "DROPOFF", status: "IN_TRANSIT" },
      ],
    } as unknown as OrderRow;
    expect(canStartHandoff(order)).toBe(true);
    expect(canStartHandoff(order, [handoff({ status: "ACCEPTED" as Handoff["status"] })])).toBe(false);
    expect(canStartHandoff(order, [handoff({ status: "CANCELLED" as Handoff["status"] })])).toBe(true);
    expect(canStartHandoff({ ...order, status: "ACCEPTED" } as OrderRow)).toBe(false);
    expect(canStartHandoff({ ...order, locations: [{ _id: "p", type: "PICKUP", status: "ARRIVED" }] } as unknown as OrderRow)).toBe(false);
    expect(canStartHandoff({ ...order, rider: null } as OrderRow)).toBe(false);
  });
});

describe("handoffs list query", () => {
  const state = { page: 2, limit: 20, filters: {} as Record<string, string> };

  it("Live defaults to the three live statuses unless a status is picked", () => {
    expect(handoffsQuery("live", state)).toMatchObject({ page: 2, limit: 20, status: LIVE_STATUS });
    expect(handoffsQuery("live", { ...state, filters: { status: "ACCEPTED" } }).status).toBe("ACCEPTED");
  });

  it("the review queue asks for review=pending and ignores the status filter", () => {
    const query = handoffsQuery("review", { ...state, filters: { status: "SEARCHING", flagged: "true" } });
    expect(query).toMatchObject({ review: "pending", flagged: true });
    expect(query.status).toBeUndefined();
  });

  it("passes the rider filter, a fixed rider and the date range through", () => {
    expect(handoffsQuery("all", { ...state, from: "2026-11-01", to: "2026-11-09", filters: { rider: "r1" } })).toMatchObject({ riderId: "r1", from: "2026-11-01", to: "2026-11-09", status: undefined });
    expect(handoffsQuery("all", { ...state, filters: { rider: "r1" } }, "fixed").riderId).toBe("fixed");
  });
});

describe("bulk review summary", () => {
  it("adds up both calls and names the first failure", () => {
    expect(bulkSummary([{ updated: 3, results: [] }]).message).toBe("3 handoffs reviewed.");
    const mixed = bulkSummary([
      { updated: 2, results: [{ id: "1", ok: true }, { id: "2", ok: true }] },
      { updated: 1, results: [{ id: "3", ok: true }, { id: "4", ok: false, error: "Only a completed handoff can be reviewed." }] },
    ]);
    expect(mixed).toEqual({ updated: 3, failed: 1, message: "3 updated, 1 not: Only a completed handoff can be reviewed." });
  });
});

describe("handoff cells and actions", () => {
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

  const labels = () => Array.from(container.querySelectorAll("button")).map((button) => button.textContent?.trim());

  it("flags carry their plain-language meaning", () => {
    act(() => root.render(<FlagChips flags={["REPEAT_7D", "GPS_FAR"]} />));
    const titles = Array.from(container.querySelectorAll("[title]")).map((el) => el.getAttribute("title"));
    expect(titles).toEqual(["3+ handoffs in 7 days", "Riders far apart at the swap"]);
  });

  it("shows the locked split in naira once the swap happened", () => {
    act(() => root.render(<SplitCell handoff={handoff({ status: "COMPLETED" as Handoff["status"], fromShare: 120000, toShare: 180000, sharePct: 40, splitBase: 300000 })} />));
    expect(container.textContent).toContain("40% to A");
    expect(container.textContent?.replace(/\s/g, "")).toContain("₦1,200/₦1,800");
    act(() => root.render(<SplitCell handoff={handoff()} />));
    expect(container.textContent).toBe("Set at the swap");
  });

  it("offers the right levers for each state", () => {
    act(() => root.render(<HandoffActions handoff={handoff({ status: "AWAITING_SUPPORT" as Handoff["status"] })} variant="buttons" />));
    expect(labels()).toEqual(["Start search", "Assign rider", "Raise bonus", "Cancel handoff"]);

    act(() => root.render(<HandoffActions handoff={handoff({ status: "ACCEPTED" as Handoff["status"], toRider: rider("b", "Bola") })} variant="buttons" />));
    expect(labels()).toEqual(["Raise bonus", "Drop rider", "Cancel handoff"]);

    act(() => root.render(<HandoffActions handoff={handoff({ status: "COMPLETED" as Handoff["status"], countDecision: "PENDING_REVIEW" as Handoff["countDecision"] })} variant="buttons" />));
    expect(labels()).toEqual(["Review"]);

    act(() => root.render(<HandoffActions handoff={handoff({ status: "EXPIRED" as Handoff["status"] })} variant="buttons" />));
    expect(labels()).toEqual([]);
  });

  it("hides every lever from a role that cannot manage handoffs", () => {
    allowed = false;
    act(() => root.render(<HandoffActions handoff={handoff()} variant="buttons" />));
    expect(labels()).toEqual([]);
  });

  it("confirms before cancelling the handoff", () => {
    act(() => root.render(<HandoffActions handoff={handoff()} variant="buttons" />));
    const cancel = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("Cancel handoff"))!;
    act(() => cancel.click());
    expect(mutate).not.toHaveBeenCalled();
    const dialog = document.body.querySelector("[role='alertdialog']") as HTMLElement;
    expect(dialog.textContent).toContain("Ada Rider keeps the order");
    const confirm = Array.from(dialog.querySelectorAll("button")).find((b) => b.textContent === "Cancel handoff")!;
    act(() => confirm.click());
    expect(mutate).toHaveBeenCalledTimes(1);
  });
});
