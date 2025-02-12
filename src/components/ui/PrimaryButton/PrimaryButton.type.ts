import { ReactNode } from "react";

export type Variant = "outline" | "destructive" | "default";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}
