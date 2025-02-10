interface TextProps extends React.CSSProperties {
  variant?: "default" | "label" | "heading";
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  Element?: React.ElementType;
}
