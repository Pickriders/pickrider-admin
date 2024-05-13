import { UI } from "@/components/common";
import { StatsCard } from "../StatsCard";
import style from "./styles.module.scss";

export const StatsContainer = () => {
  return (
    <UI.Container marginTop={20} className={style.statsContainer}>
      <StatsCard statLabel="total income" statValue={"3,465"} />
      <StatsCard statLabel="total debt" statValue={"3,465"} />
      <StatsCard statLabel="total withdrawals" statValue={"3,465"} />
      <StatsCard statLabel="pending payments" statValue={"3,465"} />
      <StatsCard statLabel="active users" statValue={"3,465"} />
      <StatsCard statLabel="inactive users" statValue={"3,465"} />
      <StatsCard statLabel="total verified business" statValue={"3,465"} />
      <StatsCard statLabel="total verified business" statValue={"3,465"} />
      <StatsCard statLabel="active bikes (on duty)" statValue={"3,465"} />
      <StatsCard statLabel="inactive bikes" statValue={"3,465"} />
    </UI.Container>
  );
};
