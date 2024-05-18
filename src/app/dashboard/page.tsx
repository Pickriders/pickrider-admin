"use client";

import { UI } from "@/components/common";
import { months, years } from "@/constant";
import { StatsContainer } from "./StatsContainer";

export default function Home() {
  return (
    <UI.Container padding={"3rem 3rem 0 3rem"}>
      <UI.Container display="flex" justifyContent="space-between">
        <UI.Heading variant="h2">Dashboard</UI.Heading>
        <UI.Container display="flex" columnGap={"1rem"}>
          <UI.Select items={months} width="91px" placeholder={"Month"} />
          <UI.Select items={years} width="91px" placeholder={"Year"} />
        </UI.Container>
      </UI.Container>
      <StatsContainer />
    </UI.Container>
  );
}
