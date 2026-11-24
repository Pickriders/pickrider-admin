"use client";

import { useCallback } from "react";

import { PageHeader, Tabs } from "@/components/kit";
import type { OrderStatus } from "@/lib/admin/api";
import { useTableState, useTabParam } from "@/lib/admin/url-state";

import type { OrdersMode } from "../mode";
import { AllOrdersTab } from "./all-orders-tab";
import { AnalysisTab } from "./analysis-tab";
import { BoardTab } from "./board-tab";
import { ScheduledTab } from "./scheduled-tab";

/**
 * Orders in one place: the live board, the full list, and the analysis that
 * used to live on three separate routes. The tab is in the URL so links from
 * elsewhere in the admin can land on the right one. `mode` "test" is the Test
 * Orders page: the same tabs over Developer API test orders, which the Orders
 * page leaves out.
 */
export type OrdersTab = "board" | "scheduled" | "all" | "analysis";
const TABS: readonly OrdersTab[] = ["board", "scheduled", "all", "analysis"];

const DESCRIPTION: Record<OrdersMode, Record<OrdersTab, string>> = {
  live: {
    board: "Every order still in motion, refreshed as riders act.",
    scheduled: "Prepaid bookings waiting for their time, and the ones riders are being rung for right now.",
    all: "Everything the platform has ever delivered, searchable and exportable.",
    analysis: "How volume, mix and outcomes are moving.",
  },
  test: {
    board: "Developer API test orders still open. They never reach riders and move no money.",
    scheduled: "Scheduled Developer API test orders waiting for their time.",
    all: "Every order placed with a Developer API test key, searchable and exportable.",
    analysis: "How test volume, mix and outcomes are moving. None of it counts in the platform's figures.",
  },
};

export const ORDERS_TITLE: Record<OrdersMode, string> = { live: "Orders", test: "Test orders" };

export function OrdersView({ mode = "live" }: { mode?: OrdersMode }) {
  const [tab, setTab] = useTabParam<OrdersTab>("board", TABS);
  const table = useTableState();

  const showAll = useCallback(
    (status: OrderStatus) => {
      table.update({ tab: "all", status, page: undefined, search: undefined, sortBy: undefined, order: undefined });
    },
    [table],
  );

  return (
    <div>
      <PageHeader title={ORDERS_TITLE[mode]} description={DESCRIPTION[mode][tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "board", label: "Board" },
          { id: "scheduled", label: "Scheduled" },
          { id: "all", label: "All orders" },
          { id: "analysis", label: "Analysis" },
        ]}
      />
      {tab === "board" ? (
        <BoardTab mode={mode} onShowAll={showAll} />
      ) : tab === "scheduled" ? (
        <ScheduledTab mode={mode} />
      ) : tab === "all" ? (
        <AllOrdersTab mode={mode} />
      ) : (
        <AnalysisTab mode={mode} />
      )}
    </div>
  );
}
