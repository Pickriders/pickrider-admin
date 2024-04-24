import styles from "./styles.module.scss";

interface StatsCardProps {
  icon: string;
  title: string;
  value: number;
}

export const StatsCard = () => {
  return (
    <div className={`${styles.statsCard}`}>
      <div className="stats-card"></div>
      <div className="stats-info">
        <h3 className="stats-title">Total Income</h3>
        <p className="stats-value">3,465</p>
      </div>
    </div>
  );
};
