interface ButtonProps extends React.CSSProperties {
  variant?: "business" | "primary" | "ghost" | "outline";
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
}
