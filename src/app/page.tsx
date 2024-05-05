"use client";

import { UI } from "@/components/common";
import { StatsCard } from "./dashboard/StatsCard";
import { SVG } from "@/components/svg";
import { ItemProps } from "@/components/common/Select/Select.type";

const mode: ItemProps[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function Home() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      <UI.Container display="grid" gap={8} columns={2} placeItems="center">
        <UI.Container
          height={200}
          width={200}
          backgroundColor="greenyellow"
        ></UI.Container>
        <UI.Container
          height={200}
          width={200}
          backgroundColor="greenyellow"
        ></UI.Container>
        <UI.Container
          height={200}
          width={200}
          backgroundColor="greenyellow"
        ></UI.Container>
        <UI.Container
          height={200}
          width={200}
          backgroundColor="greenyellow"
        ></UI.Container>
      </UI.Container>

      {/* <UI.Checkbox defaultChecked /> */}
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
      <UI.Dropdown
        trigger={
          <button className="IconButton" aria-label="Customise options">
            <SVG.FilterIcon />
          </button>
        }
      >
        <div className="">fake man</div>
      </UI.Dropdown>

      <div style={{ display: "grid", gap: "1rem" }}>
        <UI.Switch defaultChecked onCheckedChange={(e) => console.log(e)} />

        <UI.Select items={mode} placeholder={"modes"} />
        <UI.Input
          type="text"
          rightIcon={<SVG.MessageIcon />}
          placeholder="Search anything"
        />
        <UI.Input label="full name" />
        <UI.Input
          leftIcon={<SVG.SearchIcon />}
          placeholder="Start Search filtering"
        />
        <StatsCard statLabel="Total Income" statValue={3500} />
      </div>
    </main>
  );
}
