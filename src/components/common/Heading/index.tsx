import styles from "./styles.module.scss";

export const Heading = ({ children, variant, className }: HeadingProps) => {
  return (
    <h1 className={`${styles.heading} ${styles[variant]} ${className}`}>
      {children}
    </h1>
  );
};
