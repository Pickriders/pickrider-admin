import styles from "./styles.module.scss";
import { HeadingProps } from "./heading.type";

export const Heading = ({ children, variant }: HeadingProps) => {
  return <h1 className={`${styles.heading} ${styles[variant]}`}>{children}</h1>;
};
