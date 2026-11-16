/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Sidebar, activeNavHref } from "./index";

let mockPathname = "/orders";
let mockHidden: string[] = [];
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    prefetch: _prefetch,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    prefetch?: boolean;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
jest.mock("@/lib/admin/hooks", () => ({
  useAttention: () => ({ data: { ordersAwaitingRiderStale: 3 } }),
  useAlertsSummary: () => ({ data: { open: 2, claimed: 1, urgent: 1, high: 1, byType: [] } }),
  useHandoffsSummary: () => ({
    data: { searching: 1, awaitingSupport: 1, accepted: 0, pendingReview: 4, heldBonuses: 0, completedToday: 0 },
  }),
  useDeveloperQueueCount: () => ({ data: 3 }),
  useMe: () => ({
    data: { firstname: "ada", lastname: "obi", email: "ada@pickriders.com", roles: ["PLATFORM_OPERATION"] },
    isLoading: false,
  }),
}));
const mockSetParam = jest.fn();
jest.mock("@/hooks", () => ({ useQueryModal: () => ({ setParam: mockSetParam }) }));
jest.mock("@/lib/admin-access", () => ({
  getAdminRoles: () => ["PLATFORM_OPERATION"],
  canAccessSection: (href: string) => !mockHidden.includes(href),
}));

/** The desktop sidebar folds to an icon rail and back, and remembers the choice. */
describe("Sidebar collapse", () => {
  let container: HTMLDivElement;
  let root: Root;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeEach(() => {
    mockPathname = "/orders";
    mockHidden = [];
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

  it("counts unclaimed alerts, handoffs still waiting for a rider and developer teams waiting for a decision", () => {
    act(() => root.render(<Sidebar />));
    const alerts = container.querySelector("a[href='/alerts']") as HTMLElement;
    const handoffs = container.querySelector("a[href='/handoffs']") as HTMLElement;
    expect(alerts.textContent).toContain("Alerts");
    expect(alerts.textContent).toContain("2");
    // Awaiting support (1) + searching (1); the review queue is not urgent and stays off the badge.
    expect(handoffs.textContent).toContain("2");
    const developers = container.querySelector("a[href='/developers']") as HTMLElement;
    expect(developers.textContent).toContain("Developers");
    expect(developers.textContent).toContain("3");
  });

  it("links the message log under Operations and the email gallery under System", () => {
    act(() => root.render(<Sidebar />));
    expect(container.querySelector("a[href='/messages']")?.textContent).toContain("Messages");
    expect(container.querySelector("a[href='/emails']")?.textContent).toContain("Emails");
  });

  it("lists Emails and Settings under System: Admin merged into Settings", () => {
    act(() => root.render(<Sidebar />));
    const system = Array.from(container.querySelectorAll("p")).find((p) => p.textContent === "System")
      ?.parentElement as HTMLElement;
    expect(Array.from(system.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual([
      "/emails",
      "/dashboard/settings",
    ]);
    expect(container.querySelector("a[href='/admin']")).toBeNull();

    act(() => root.unmount());
    root = createRoot(container);
    mockHidden = ["/admin"];
    act(() => root.render(<Sidebar />));
    expect(container.querySelector("a[href='/admin']")).toBeNull();
    expect(container.querySelector("a[href='/dashboard/settings']")).not.toBeNull();
  });

  it("marks only the deepest match active, so Settings does not light up Dashboard too", () => {
    mockPathname = "/dashboard/settings";
    act(() => root.render(<Sidebar />));
    expect(container.querySelector("a[href='/dashboard/settings']")?.getAttribute("aria-current")).toBe("page");
    expect(container.querySelector("a[href='/dashboard']")?.getAttribute("aria-current")).toBeNull();
  });

  it("pins the signed-in account to the bottom with a log out icon", () => {
    act(() => root.render(<Sidebar />));
    const text = aside().textContent ?? "";
    expect(text).toContain("Ada Obi");
    expect(text).toContain("Operations");
    const logout = container.querySelector("button[aria-label='Log out']") as HTMLButtonElement;
    act(() => logout.click());
    expect(mockSetParam).toHaveBeenCalledWith("logout", "true");
  });

  it("opens the account shortcuts from the name: Profile and Security in Settings, then Log out", () => {
    act(() => root.render(<Sidebar />));
    const trigger = container.querySelector("button[aria-haspopup='menu']") as HTMLButtonElement;
    act(() => trigger.click());
    const menu = container.querySelector("[role='menu']");
    expect(menu?.querySelector("a[href='/dashboard/settings']")?.textContent).toContain("Profile");
    expect(menu?.querySelector("a[href='/dashboard/settings?tab=security']")?.textContent).toContain("Security");
    expect(menu?.textContent).toContain("Log out");
  });

  it("opens collapsed when that was the last choice on this device", () => {
    window.localStorage.setItem("pickriders_admin_sidebar_collapsed", "1");
    act(() => root.render(<Sidebar />));
    expect(aside().className).toContain("w-[4.5rem]");
  });
});

describe("activeNavHref", () => {
  it("picks the longest href the path sits under", () => {
    expect(activeNavHref("/dashboard")).toBe("/dashboard");
    expect(activeNavHref("/dashboard/settings")).toBe("/dashboard/settings");
    expect(activeNavHref("/orders/123")).toBe("/orders");
    expect(activeNavHref("/admins")).toBeUndefined();
    expect(activeNavHref("/nowhere")).toBeUndefined();
  });
});
