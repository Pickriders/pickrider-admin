/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { PrimaryButton } from "./index";

/** The busy state must not move the label: same text in the flow, spinner overlaid, button disabled. */
describe("PrimaryButton", () => {
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

  const button = () => container.querySelector("button") as HTMLButtonElement;
  const label = () => button().firstElementChild as HTMLSpanElement;

  it("renders the label, enabled and not busy, by default", () => {
    act(() => root.render(<PrimaryButton type="submit">Sign in</PrimaryButton>));
    expect(button().disabled).toBe(false);
    expect(button().getAttribute("aria-busy")).toBeNull();
    expect(label().textContent).toBe("Sign in");
    expect(label().className).not.toContain("invisible");
    expect(container.querySelector("[data-testid='button-spinner']")).toBeNull();
  });

  it("keeps the label in the flow (invisible) and overlays a spinner while loading", () => {
    act(() =>
      root.render(
        <PrimaryButton loading loadingText="Signing in">
          Sign in
        </PrimaryButton>,
      ),
    );
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-busy")).toBe("true");
    expect(button().className).toContain("relative");
    // The same label is still rendered, so the width does not change.
    expect(label().textContent).toBe("Sign in");
    expect(label().className).toContain("invisible");
    expect(label().getAttribute("aria-hidden")).toBe("true");
    const spinner = container.querySelector("[data-testid='button-spinner']") as HTMLSpanElement;
    expect(spinner.className).toContain("absolute");
    expect(spinner.querySelector("[role='status']")?.textContent).toBe("Signing in");
  });

  it("accepts the older isLoading spelling", () => {
    act(() => root.render(<PrimaryButton isLoading>Save</PrimaryButton>));
    expect(button().getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector("[role='status']")?.textContent).toBe("Loading");
  });

  it("stays disabled when asked to, even without loading", () => {
    act(() => root.render(<PrimaryButton disabled>Send</PrimaryButton>));
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-busy")).toBeNull();
  });

  it("passes a link child through untouched with asChild", () => {
    act(() =>
      root.render(
        <PrimaryButton asChild>
          <a href="/auth/login">Proceed</a>
        </PrimaryButton>,
      ),
    );
    expect(container.querySelector("button")).toBeNull();
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.textContent).toBe("Proceed");
    expect(link.className).toContain("rounded-lg");
  });
});
