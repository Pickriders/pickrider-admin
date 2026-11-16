/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { OrderRow } from "@/lib/admin/api";

import { CourierCell, PartiesLine, ReleasedChip } from "./order-cells";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, prefetch: _prefetch, ...rest }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const LONG = "Oluwaseun Chukwuemeka Abdulrasheed-Okonkwo";

function order(patch: Partial<OrderRow> = {}): OrderRow {
  return {
    _id: "o1",
    orderNumber: "PK-1001",
    status: "ON_GOING",
    channel: "APP",
    user: { _id: "c1", firstname: "Ada", lastname: "Obi", phone: "2348011111111" },
    rider: { _id: "r1", firstname: LONG.split(" ")[0], lastname: LONG.split(" ").slice(1).join(" "), phone: "2348022222222" },
    riderReleaseCount: 2,
    createdAt: "2026-11-10T09:00:00.000Z",
    ...patch,
  } as unknown as OrderRow;
}

/** A released order's courier: the chip shares the line, the name truncates, the full name is on the title. */
describe("CourierCell with a Released chip", () => {
  let container: HTMLDivElement;
  let root: Root;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const nameSpan = () => container.querySelector(`[title="${LONG}"]`) as HTMLSpanElement;
  const chip = () => container.querySelector("[role='link']") as HTMLSpanElement;

  it("keeps the courier and the chip on one row, with the chip unable to shrink", () => {
    act(() => root.render(<CourierCell order={order()} size={24} />));
    const row = container.querySelector("[data-testid='courier-cell']") as HTMLSpanElement;
    expect(row.className).toContain("items-center");
    expect(row.className).not.toContain("flex-col");
    // The courier takes the remaining width and may shrink to zero so the name can truncate.
    const courier = row.firstElementChild as HTMLSpanElement;
    expect(courier.className).toContain("min-w-0");
    expect(courier.className).toContain("flex-1");
    // The chips cannot shrink, so they never wrap under the name or push out of the card.
    const chips = row.lastElementChild as HTMLSpanElement;
    expect(chips.className).toContain("shrink-0");
    expect(chips.className).not.toContain("flex-wrap");
    expect(chip().className).toContain("shrink-0");
    expect(chip().className).toContain("whitespace-nowrap");
    expect(chip().textContent).toBe("Released 2x");
  });

  it("truncates the rider's name on one line and keeps the full name on the title", () => {
    act(() => root.render(<CourierCell order={order()} size={24} />));
    const name = nameSpan();
    expect(name).not.toBeNull();
    expect(name.textContent).toBe(LONG);
    expect(name.className).toContain("truncate");
    expect(name.className).toContain("block");
  });

  it("does not add the chip row when nothing was released or handed off", () => {
    act(() => root.render(<CourierCell order={order({ riderReleaseCount: 0 })} size={24} />));
    expect(container.querySelector("[data-testid='courier-cell']")).toBeNull();
    expect(container.querySelector("[role='link']")).toBeNull();
    expect(nameSpan().className).toContain("truncate");
  });

  it("opens the rider history from the chip without following the row", () => {
    act(() => root.render(<ReleasedChip order={order()} />));
    act(() => chip().click());
    expect(push).toHaveBeenCalledWith("/orders/o1#rider-history");
  });

  it("says 'Rider released' while the order waits for its next rider", () => {
    act(() => root.render(<ReleasedChip order={order({ rider: null, riderReleaseCount: 1 })} />));
    expect(chip().textContent).toBe("Rider released");
  });
});

/** The phone card's "customer -> courier" line: both halves may shrink and both names truncate. */
describe("PartiesLine", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("gives the customer and courier halves min-w-0 so a long name truncates instead of overflowing", () => {
    act(() => root.render(<PartiesLine order={order()} />));
    const line = container.firstElementChild as HTMLSpanElement;
    expect(line.className).toContain("min-w-0");
    const [customer, , courier] = Array.from(line.children) as HTMLSpanElement[];
    expect(customer.className).toContain("min-w-0");
    expect(customer.className).toContain("flex-1");
    expect(courier.className).toContain("min-w-0");
    expect(courier.className).toContain("flex-1");
    expect((container.querySelector('[title="Ada Obi"]') as HTMLSpanElement).className).toContain("truncate");
    expect((container.querySelector(`[title="${LONG}"]`) as HTMLSpanElement).className).toContain("truncate");
    expect(container.querySelector("[role='link']")?.textContent).toBe("Released 2x");
  });
});
