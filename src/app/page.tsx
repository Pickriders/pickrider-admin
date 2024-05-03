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
      <UI.Checkbox />
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
          <button className="IconButton" aria-label="Customise options">
            <SVG.FilterIcon />
          </button>
        </UI.DropdownMenuTrigger>
        <UI.DropdownMenuContent>
          <UI.DropdownMenuItem>light moder</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Send Email</UI.DropdownMenuItem>
          <div className="">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla magni
            facilis mollitia, ipsam doloribus cum modi incidunt aliquid
            voluptatibus expedita praesentium vel reiciendis aut aliquam
            inventore quam nesciunt quia! Quam!
          </div>
        </UI.DropdownMenuContent>
      </UI.DropdownMenu>

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
