"use client";

import { useCallback } from "react";

import { PageHeader, Tabs } from "@/components/kit";
import type { OrderStatus } from "@/lib/admin/api";
import { useTableState, useTabParam } from "@/lib/admin/url-state";

import { AllOrdersTab } from "./all-orders-tab";
import { AnalysisTab } from "./analysis-tab";
import { BoardTab } from "./board-tab";

/**
 * Orders in one place: the live board, the full list, and the analysis that
 * used to live on three separate routes. The tab is in the URL so links from
 * elsewhere in the admin can land on the right one.
 */
export type OrdersTab = "board" | "all" | "analysis";
const TABS: readonly OrdersTab[] = ["board", "all", "analysis"];

const DESCRIPTION: Record<OrdersTab, string> = {
  board: "Every order still in motion, refreshed as riders act.",
  all: "Everything the platform has ever delivered, searchable and exportable.",
  analysis: "How volume, mix and outcomes are moving.",
};

export function OrdersView() {
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
      <PageHeader title="Orders" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "board", label: "Board" },
          { id: "all", label: "All orders" },
          { id: "analysis", label: "Analysis" },
        ]}
      />
      {tab === "board" ? <BoardTab onShowAll={showAll} /> : tab === "all" ? <AllOrdersTab /> : <AnalysisTab />}
    </div>
  );
}
