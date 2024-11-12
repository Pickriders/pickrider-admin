"use client";

import { UI } from "@/components/ui";
import { StatsContainer } from "./StatsContainer";
import { FilterDyDate } from "./FilterByDate";

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

// @DEPERICATED DESIGN
// <UI.Container padding={"3rem 2rem 0 2rem"}>
//   <UI.Container
//     display="flex"
//     alignItems="center"
//     justifyContent="space-between"
//   >
//     <UI.Heading variant="h2">Dashboard</UI.Heading>
//     <UI.Container display="flex" columnGap={"1rem"}>
//       <UI.Select items={months} width="91px" placeholder={"Month"} />
//       <UI.Select items={years} width="91px" placeholder={"Year"} />
//     </UI.Container>
//   </UI.Container>
//   <StatsContainer />
// </UI.Container>
