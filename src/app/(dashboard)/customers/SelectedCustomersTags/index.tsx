"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

import Link from "next/link";
import React, { Suspense } from "react";
import { SelectedCustomersList } from "../SelectedCustomersList";

export const SelectedCustomersTag = () => {
  return (
    <div className="flex items-center gap-x-4">
      {Array(10)
        .fill(0)
        .slice(0, 7)
        .map((_, i) => (
          <UI.Tag key={i} />
        ))}
      <Link
        href={"?selected-customers=true"}
        className="bg-muted  px-4 transition-colors duration-300 hover:bg-neutral-300 dark:hover:bg-neutral-700/55 text-xs font-semibold font-montserrat rounded-2xl flex items-center justify-between h-9 w-[7.5rem]"
      >
        +30 more <SVG.ChevronDown width={12} height={12} />
      </Link>
      <Suspense>
        <SelectedCustomersList />
      </Suspense>
    </div>
  );
};
