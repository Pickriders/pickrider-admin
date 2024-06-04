import styles from "./styles.module.scss";

export const Text = ({
  children,
  style,
  variant = "default",
  Element = "p",
  className,
  ...rest
}: TextProps) => {
  const elementStyles = {
    style,
    ...rest,
  };

  return (
    <Element
      style={elementStyles}
      className={`${styles.text} ${styles[variant]} ${className}`}
    >
      {children}
    </Element>
  );
};
