/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Sidebar } from "./index";

jest.mock("next/navigation", () => ({ usePathname: () => "/orders" }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, prefetch: _prefetch, ...rest }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
jest.mock("@/lib/admin/hooks", () => ({ useAttention: () => ({ data: { ordersAwaitingRiderStale: 3 } }) }));
jest.mock("@/lib/admin-access", () => ({ getAdminRoles: () => [], canAccessSection: () => true }));

/** The desktop sidebar folds to an icon rail and back, and remembers the choice. */
describe("Sidebar collapse", () => {
  let container: HTMLDivElement;
  let root: Root;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const aside = () => container.querySelector("aside") as HTMLElement;
  const toggle = () => container.querySelector("button[aria-label$='sidebar']") as HTMLButtonElement;

  it("collapses to the icon rail and expands again when the toggle is clicked", () => {
    act(() => root.render(<Sidebar />));
    expect(aside().className).toContain("w-[15.5rem]");
    expect(container.textContent).toContain("Orders");

    act(() => toggle().click());
    expect(aside().className).toContain("w-[4.5rem]");
    expect(toggle().getAttribute("aria-label")).toBe("Expand sidebar");
    // Labels move to hover titles; the count becomes a dot.
    expect(container.textContent).not.toContain("Orders");
    expect(container.querySelector("a[href='/orders']")?.getAttribute("title")).toBe("Orders (3)");
    expect(window.localStorage.getItem("pickriders_admin_sidebar_collapsed")).toBe("1");

    act(() => toggle().click());
    expect(aside().className).toContain("w-[15.5rem]");
    expect(container.textContent).toContain("Orders");
    expect(window.localStorage.getItem("pickriders_admin_sidebar_collapsed")).toBe("0");
  });

  it("opens collapsed when that was the last choice on this device", () => {
    window.localStorage.setItem("pickriders_admin_sidebar_collapsed", "1");
    act(() => root.render(<Sidebar />));
    expect(aside().className).toContain("w-[4.5rem]");
  });
});
