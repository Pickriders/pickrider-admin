import styles from "./styles.module.scss";
import { UI } from "@/components/common";
import { StatsCardProps } from "./statsCard.type";
import { SVG } from "@/components/svg";

export const StatsCard = ({ statLabel, statValue }: StatsCardProps) => {
  return (
    <div className={`${styles.statsCard}`}>
      <div>
        <SVG.MessageIcon />
      </div>
      <div className={styles.statsCard_info}>
        <UI.Text variant="statLabel">{statLabel}</UI.Text>
        <UI.Text variant="statValue">{statValue}</UI.Text>
      </div>
    </div>
  );
};
