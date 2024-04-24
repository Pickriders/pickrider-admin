import { ButtonProps } from "./button.type";
import styles from "./styles.module.scss";

export const Button = ({ children, variant, type }: ButtonProps) => {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
};
