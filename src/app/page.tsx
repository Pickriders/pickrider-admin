import { UI } from "@/components/common";
import { StatsCard } from "./dashboard/StatsCard";
import { SVG } from "@/components/svg";

export default function Home() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        width: 1000,
        margin: "0 auto",
      }}
    >
      <UI.Input
        type="text"
        hasIcon={false}
        placeholder="Search anything"
        label="Search anything"
      />
      <StatsCard statLabel="Total Income" statValue={3500} />
    </main>
  );
}
