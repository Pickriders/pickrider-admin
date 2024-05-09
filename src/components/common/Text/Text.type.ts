type TextProps = {
  variant?: "default" | "statLabel" | "statValue" | "heading";
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  Element?: React.ElementType;
};
