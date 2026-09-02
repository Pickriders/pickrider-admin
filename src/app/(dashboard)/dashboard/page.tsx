"use client";

import * as React from "react";
import { StatsContainer } from "./StatsContainer";
import { RangeTabs } from "../analytics/RangeTabs";

export default function Home() {
  const [days, setDays] = React.useState(30);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-clash-display text-2xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything happening across Pickriders at a glance.
          </p>
        </div>
        <RangeTabs value={days} onChange={setDays} />
      </div>

      <StatsContainer days={days} />
    </div>
  );
}
