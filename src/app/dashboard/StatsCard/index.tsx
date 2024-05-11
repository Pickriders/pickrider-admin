import styles from "./styles.module.scss";
import { UI } from "@/components/common";
import { SVG } from "@/components/svg";

export const StatsCard = ({ statLabel, statValue }: StatsCardProps) => {
  return (
    <UI.Container className={`${styles.statsCard}`}>
      <UI.Container>
        <SVG.MessageIcon />
      </UI.Container>
      <UI.Container className={styles.statsCard_info}>
        <UI.Text variant="statLabel">{statLabel}</UI.Text>
        <UI.Text variant="statValue">{statValue}</UI.Text>
      </UI.Container>
    </UI.Container>
  );
};
