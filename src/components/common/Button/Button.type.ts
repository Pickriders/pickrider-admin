type ButtonProps = {
  variant: "business" | "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
};
