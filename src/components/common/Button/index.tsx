import styles from "./styles.module.scss";

export const Button = ({ children, variant, type, className }: ButtonProps) => {
  return (
    <button
      type={type}
      className={`${className} ${styles.button} ${styles[variant]}`}
    >
      {children}
    </button>
  );
};
