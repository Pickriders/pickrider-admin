import styles from "./styles.module.scss";

export const Button = ({
  children,
  variant = "primary",
  type,
  className,
  ...rest
}: ButtonProps) => {
  return (
    <button
      style={{ ...rest }}
      type={type}
      className={`${className} ${styles.button} ${styles[variant]}`}
    >
      {children}
    </button>
  );
};
