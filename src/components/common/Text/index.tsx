import styles from "./styles.module.scss";

export const Text = ({ children, style, variant = "default" }: TextProps) => {
  return (
    <p style={style} className={`${styles.text} ${styles[variant]}`}>
      {children}
    </p>
  );
};
