"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

import Link from "next/link";
import React, { Suspense } from "react";
import { SelectedListTable } from "../SelectedListTable";

export const SelectedTags = () => {
  return (
    <div className="flex  items-center gap-x-3">
      <div className="flex  items-center gap-x-3.5 overflow-x-hidden">
        {Array(10)
          .fill(0)
          .slice(0, 7)
          .map((_, i) => (
            <UI.Tag key={i} />
          ))}
      </div>
      <Link
        href={"?selected-tags=true"}
        className="bg-muted  px-4 transition-colors duration-300 hover:bg-neutral-300 dark:hover:bg-neutral-700/55 text-xs font-semibold font-montserrat rounded-2xl flex items-center justify-between h-9 w-[7.5rem]"
      >
        +30 more <SVG.ChevronDown width={12} height={12} />
      </Link>
      <Suspense>
        <SelectedListTable data={Array(20).fill(0)} />
      </Suspense>
    </div>
  );
};
