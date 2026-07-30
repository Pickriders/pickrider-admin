"use client";

import React from "react";
import { UI } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataTable } from "./DataTable";
import { motion } from "framer-motion";

// Tabs map to real backend statuses (there is no REJECTED/MISSED status).
const STATUS_TABS = [
  { slug: "completed", label: "Completed", status: "COMPLETED" },
  { slug: "cancelled", label: "Cancelled", status: "CANCELLED" },
  { slug: "ongoing", label: "Ongoing", status: "ON_GOING" },
  { slug: "pending", label: "Pending", status: "INITIATED" },
];

export const Tables = () => {
  const searchParams = useSearchParams();
  const orderStatus = searchParams.get("order-status") || "completed";
  const activeTab = STATUS_TABS.find((tab) => tab.slug === orderStatus) ?? STATUS_TABS[0];
  const [search, setSearch] = React.useState("");

  return (
    <div>
      <div className="flex items-center justify-end mt-3">
        <UI.TableSearchInput placeholder="Search order number..." className="rounded-lg" onSearch={setSearch} />
      </div>
      <div className="flex sm:mt-7 mt-4 items-center justify-center border-b divide-x pb-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.slug}
            href={`?order-status=${tab.slug}`}
            scroll={false}
            className={cn(
              "inline-block  relative capitalize text-center hover:text-primary transition-colors duration-150   py-2 sm:px-10 px-4 sm:w-[13.1rem] font-clash-display font-semibold",
              activeTab.slug === tab.slug ? "text-primary" : "dark:text-neutral-600 text-neutral-400 ",
            )}
          >
            {tab.label}
            {activeTab.slug === tab.slug && (
              <div className="absolute h-[1px] w-[94%] left-1/2 -translate-x-1/2 bottom-0 bg-primary" />
            )}
          </Link>
        ))}
      </div>
      <motion.div
        key={activeTab.slug}
        initial={{ translateY: 30, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ ease: "easeInOut" }}
        className="mt-2"
      >
        <DataTable status={activeTab.status} orderNumber={search || undefined} />
      </motion.div>
    </div>
  );
};
