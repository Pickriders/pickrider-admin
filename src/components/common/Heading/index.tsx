import styles from "./styles.module.scss";

export const Heading = ({ children, variant }: HeadingProps) => {
  return <h1 className={`${styles.heading} ${styles[variant]}`}>{children}</h1>;
};
