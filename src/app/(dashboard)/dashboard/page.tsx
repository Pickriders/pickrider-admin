import { UI } from "@/components/ui";
import { FilterDyDate } from "./FilterByDate";
import { StatsContainer } from "./StatsContainer";

export default function Home() {
  return (
    <div className="2xl:max-w-[73rem] xl:max-w-[70rem] mx-auto ">
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Dashboard" />
        <FilterDyDate />
      </div>

      <StatsContainer />
    </div>
  );
}
