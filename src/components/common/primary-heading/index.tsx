import { PrimaryHeadingProps } from "./primaryHeading.type";
import styles from "./styles.module.scss";

export const PrimaryHeading = ({ children }: PrimaryHeadingProps) => {
  return <h1 className={styles.primaryHeading}>{children}</h1>;
};
