/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";

import { useSetQueryParam } from "./useQueryModal";

const replace = jest.fn();
const useSearchParams = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/orders",
  useSearchParams: () => useSearchParams(),
}));

describe("useSetQueryParam", () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  it("adds the param to the current URL on call, without subscribing to the search params", () => {
    window.history.replaceState(null, "", "/orders?tab=all&page=2");
    let setParam: (name: string, value: string) => void = () => undefined;
    function Probe() {
      setParam = useSetQueryParam();
      return null;
    }
    const container = document.createElement("div");
    const root = createRoot(container);
    act(() => root.render(<Probe />));

    setParam("logout", "true");

    expect(replace).toHaveBeenCalledWith("?tab=all&page=2&logout=true", { scroll: false });
    // Reading search params with useSearchParams is what forces a page out of prerendering.
    expect(useSearchParams).not.toHaveBeenCalled();
    act(() => root.unmount());
  });
});
