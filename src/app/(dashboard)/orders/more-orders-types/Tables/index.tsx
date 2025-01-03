"use client";

import { UI } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataTable } from "./DataTable";
import { motion } from "framer-motion";

const statusList = ["total", "single", "batch delivery", "bulk pickup"];

export const Tables = () => {
  const searchParams = useSearchParams();
  const orderStatus = searchParams.get("order-type") || "total";

  const datas: { [key: string]: number[] } = {
    total: Array(7).fill(0),
    single: Array(10).fill(0),
    "batch delivery": Array(5).fill(0),
    "bulk pickup": Array(8).fill(0),
  };

  return (
    <div>
      <div className="flex items-center justify-end mt-3">
        <UI.TableSearchInput
          placeholder="Search order number..."
          className="rounded-lg"
        />
      </div>
      <div className="flex mt-7 items-center justify-center border-b divide-x pb-1.5">
        {statusList.map((status, i) => (
          <Link
            key={i}
            href={`?order-type=${status}`}
            scroll={false}
            className={cn(
              "inline-block  relative capitalize text-center hover:text-primary transition-colors duration-150   py-2 px-10 w-[13.1rem] font-clash-display font-semibold",
              orderStatus === status
                ? "text-primary"
                : "dark:text-neutral-600 text-neutral-400 "
            )}
          >
            {status}
            {orderStatus === status && (
              <div className="absolute h-[1px] w-[94%] left-1/2 -translate-x-1/2 bottom-0 bg-primary" />
            )}
          </Link>
        ))}
      </div>
      <motion.div
        key={orderStatus}
        initial={{ translateY: 30, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ ease: "easeInOut" }}
        className="mt-2"
      >
        <DataTable data={datas[orderStatus]} />
      </motion.div>
    </div>
  );
};
