import { UI } from "@/components/ui";
import { StatsContainer } from "./StatsContainer";
import { FilterDyDate } from "./FilterByDate";

export default function Home() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Dashboard" />
        <FilterDyDate />
      </div>

      <StatsContainer />
    </div>
  );
}
