import { UI } from "@/components/ui";
import { FilterDyDate } from "./FilterByDate";
import { StatsContainer } from "./StatsContainer";

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
