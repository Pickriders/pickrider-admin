import styles from "./styles.module.scss";

export const Text = ({
  children,
  style,
  variant = "default",
  Element = "p",
  className,
}: TextProps) => {
  return (
    <Element
      style={style}
      className={` ${styles.text} ${styles[variant]} ${className}`}
    >
      {children}
    </Element>
  );
};
