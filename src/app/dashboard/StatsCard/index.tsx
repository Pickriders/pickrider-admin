import styles from "./styles.module.scss";
import { UI } from "@/components/common";
import { SVG } from "@/components/svg";

export const StatsCard = ({
  statLabel,
  statValue,
  className,
}: StatsCardProps) => {
  return (
    <UI.Container
      className={`${className ? className : ""} ${styles.statsCard}`}
    >
      <UI.Container>
        <SVG.MessageIcon />
      </UI.Container>
      <UI.Container className={styles.statsCard_info}>
        <UI.Text className={styles.truncate} variant="label">
          {statLabel}
        </UI.Text>
        <UI.Heading variant="h1">{statValue}</UI.Heading>
      </UI.Container>
    </UI.Container>
  );
};
