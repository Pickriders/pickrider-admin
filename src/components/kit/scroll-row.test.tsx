/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ScrollRow, TableScroll, edgeMask } from "./scroll-row";

/** Sideways-scroll hint: fades and arrows only where there is more to see. */
describe("ScrollRow", () => {
  let container: HTMLDivElement;
  let root: Root;
  let widths = { scroll: 0, client: 0 };
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => widths.scroll });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => widths.client });
    HTMLElement.prototype.scrollTo = jest.fn() as unknown as HTMLElement["scrollTo"];
    HTMLElement.prototype.scrollBy = jest.fn() as unknown as HTMLElement["scrollBy"];
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const arrows = () => Array.from(container.querySelectorAll("button[aria-label^='Scroll']")).map((b) => b.getAttribute("aria-label"));
  const scroller = () => container.querySelector("[role='group'], .overflow-x-auto") as HTMLDivElement;

  it("shows nothing when the content fits", () => {
    widths = { scroll: 300, client: 300 };
    act(() => root.render(<ScrollRow label="Chips">a</ScrollRow>));
    expect(arrows()).toEqual([]);
    expect(scroller().style.maskImage).toBe("");
  });

  it("offers the right arrow at the start and both once scrolled into the middle", () => {
    widths = { scroll: 900, client: 300 };
    act(() => root.render(<ScrollRow label="Chips">a</ScrollRow>));
    expect(arrows()).toEqual(["Scroll right"]);

    const el = scroller();
    el.scrollLeft = 200;
    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(arrows()).toEqual(["Scroll left", "Scroll right"]);

    el.scrollLeft = 600;
    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(arrows()).toEqual(["Scroll left"]);
  });

  it("pages along when an arrow is pressed", () => {
    widths = { scroll: 900, client: 300 };
    act(() => root.render(<ScrollRow label="Chips">a</ScrollRow>));
    const right = container.querySelector("button[aria-label='Scroll right']") as HTMLButtonElement;
    act(() => right.click());
    expect(scroller().scrollBy).toHaveBeenCalledWith({ left: 210, behavior: "smooth" });
  });

  it("pins table arrows near the header, inside the box, and keeps the scrollbar", () => {
    widths = { scroll: 1200, client: 600 };
    act(() =>
      root.render(
        <TableScroll arrowTop="16px">
          <table />
        </TableScroll>,
      ),
    );
    const right = container.querySelector("button[aria-label='Scroll right']") as HTMLButtonElement;
    expect(right.style.top).toBe("16px");
    expect(right.className).toContain("right-1.5");
    expect(scroller().className).toContain("admin-scroll");
  });
});

describe("edgeMask", () => {
  it("fades only the edges with more content", () => {
    expect(edgeMask({ left: false, right: false })).toBeUndefined();
    expect(edgeMask({ left: false, right: true })).toBe(
      "linear-gradient(to right, #000 0, #000 0px, #000 calc(100% - 28px), transparent 100%)",
    );
    expect(edgeMask({ left: true, right: false })).toBe(
      "linear-gradient(to right, transparent 0, #000 28px, #000 calc(100% - 0px), #000 100%)",
    );
  });
});
