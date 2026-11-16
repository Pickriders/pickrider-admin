/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Popover, isPhoneViewport, popoverSide } from "./popover";

/** Pure side pick: keep the preferred edge, flip when it would leave the viewport. */
describe("popoverSide", () => {
  const panel = { panelWidth: 320, viewportWidth: 1280 };

  it("keeps the preferred side when the panel fits", () => {
    expect(popoverSide({ preferred: "start", anchorLeft: 100, anchorRight: 220, ...panel })).toBe("start");
    expect(popoverSide({ preferred: "end", anchorLeft: 600, anchorRight: 720, ...panel })).toBe("end");
  });

  it("flips a left-anchored panel to the right edge near the right side of the screen", () => {
    // 1100 + 320 + 8 > 1280: hanging from the left would run off; hanging from the right fits.
    expect(popoverSide({ preferred: "start", anchorLeft: 1100, anchorRight: 1220, ...panel })).toBe("end");
    // Exactly fits (1280 - 320 - 8 = 952) stays put.
    expect(popoverSide({ preferred: "start", anchorLeft: 952, anchorRight: 1000, ...panel })).toBe("start");
  });

  it("flips a right-anchored panel to the left edge near the left side of the screen", () => {
    expect(popoverSide({ preferred: "end", anchorLeft: 16, anchorRight: 120, ...panel })).toBe("start");
  });

  it("falls back to the preferred side when neither edge fits", () => {
    const narrow = { panelWidth: 320, viewportWidth: 300 };
    expect(popoverSide({ preferred: "start", anchorLeft: 10, anchorRight: 290, ...narrow })).toBe("start");
    expect(popoverSide({ preferred: "end", anchorLeft: 10, anchorRight: 290, ...narrow })).toBe("end");
  });

  it("respects a custom edge gutter", () => {
    expect(popoverSide({ preferred: "start", anchorLeft: 950, anchorRight: 1000, edge: 0, ...panel })).toBe("start");
    expect(popoverSide({ preferred: "start", anchorLeft: 950, anchorRight: 1000, edge: 20, ...panel })).toBe("end");
  });

  it("treats everything under Tailwind's sm breakpoint as a phone", () => {
    expect(isPhoneViewport(320)).toBe(true);
    expect(isPhoneViewport(639)).toBe(true);
    expect(isPhoneViewport(640)).toBe(false);
    expect(isPhoneViewport(1280)).toBe(false);
  });
});

/** Rendering: anchored panel on desktop, portalled sheet on phones; Escape and the backdrop close. */
describe("Popover", () => {
  let container: HTMLDivElement;
  let root: Root;
  let phone = false;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeAll(() => {
    window.matchMedia = ((query: string) => ({
      matches: phone,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
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

  function Host({ onClose, align }: { onClose: () => void; align?: "start" | "end" }) {
    const ref = React.useRef<HTMLDivElement>(null);
    return (
      <div ref={ref} className="relative">
        <button type="button">Dates</button>
        <Popover open onClose={onClose} anchorRef={ref} align={align} title="Pick dates">
          <input type="date" aria-label="From" />
        </Popover>
      </div>
    );
  }

  it("hangs under the anchor on desktop and closes on Escape", () => {
    phone = false;
    const onClose = jest.fn();
    act(() => root.render(<Host onClose={onClose} />));
    const panel = container.querySelector("[data-popover='anchored']") as HTMLDivElement;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute("data-side")).toBe("start");
    expect(panel.className).toContain("left-0");
    expect(document.body.querySelector("[data-popover='sheet']")).toBeNull();

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a press outside the anchor and panel, not on one inside", () => {
    phone = false;
    const onClose = jest.fn();
    act(() => root.render(<Host onClose={onClose} />));
    const inside = container.querySelector("input[aria-label='From']") as HTMLInputElement;
    act(() => {
      inside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("becomes a bottom sheet on phones with a backdrop that closes it", () => {
    phone = true;
    const onClose = jest.fn();
    act(() => root.render(<Host onClose={onClose} align="end" />));
    expect(container.querySelector("[data-popover='anchored']")).toBeNull();
    const sheet = document.body.querySelector("[data-popover='sheet']") as HTMLDivElement;
    expect(sheet).not.toBeNull();
    const dialog = sheet.querySelector("[role='dialog']") as HTMLDivElement;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Pick dates");
    expect(dialog.className).toContain("inset-x-0");
    expect(dialog.className).toContain("bottom-0");
    expect(dialog.className).toContain("safe-area-inset-bottom");
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      (sheet.querySelector("[data-popover-backdrop]") as HTMLDivElement).click();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
