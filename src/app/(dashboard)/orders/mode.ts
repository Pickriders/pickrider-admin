import type { RangeQuery } from "@/lib/admin/api";
import { useOverview, useTestOrdersOverview } from "@/lib/admin/hooks";

/**
 * The Orders page shows live orders only; Developer API test orders (livemode: false) get their own
 * Test Orders page with the same tabs. Every tab takes the mode and scopes its calls with it.
 */
export type OrdersMode = "live" | "test";

/** The `livemode` filter for GET admins/orders: "true" leaves test orders out, "false" lists only them. */
export function livemodeQuery(mode: OrdersMode) {
  return { livemode: mode === "test" ? "false" : "true" } as const;
}

/** The order window and board counts for the mode: the overview for live orders, test-orders for test ones. */
export function useOrdersOverview(mode: OrdersMode, range: RangeQuery) {
  const live = useOverview(range, mode === "live");
  const test = useTestOrdersOverview(range, mode === "test");
  return mode === "test" ? test : live;
}
