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
      <UI.Select items={mode} placeholder={"modes"} />

      <UI.Input
        type="text"
        rightIcon={<SVG.MessageIcon />}
        placeholder="Search anything"
      />
      <StatsCard statLabel="Total Income" statValue={3500} />
    </main>
  );
}
