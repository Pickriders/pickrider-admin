import { StatsCard } from "./dashboard/StatsCard";

export default function Home() {
  return (
    <main>
      <StatsCard statLabel="Total Verified Business" statValue={3465} />
    </main>
  );
}
