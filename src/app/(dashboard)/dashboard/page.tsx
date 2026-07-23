import { StatsContainer } from "./StatsContainer";
import { FilterDyDate } from "./FilterByDate";

export default function Home() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-clash-display text-2xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything happening across Pickriders at a glance.
          </p>
        </div>
        <FilterDyDate />
      </div>

      <StatsContainer />
    </div>
  );
}
