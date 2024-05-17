import { UI } from "@/components/common";
import { StatsCard } from "../StatsCard";
import style from "./styles.module.scss";
import "@/styles/layout/_grid.scss";

export const StatsContainer = () => {
  return (
    <UI.Container marginTop={20} rowGap={"1rem"} className="row">
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="total income"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="total debt"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="total withdrawals"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="pending payments"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="active users"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="inactive users"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="total verified business"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="total verified business"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="active bikes (on duty)"
        statValue={"3,465"}
      />
      <StatsCard
        className="col-6 col-lg-5"
        statLabel="inactive bikes"
        statValue={"3,465"}
      />
    </UI.Container>
  );
};
