type ButtonProps = {
  variant: "business" | "primary" | "ghost" | "outline";
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
};
