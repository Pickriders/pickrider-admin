import { ReactNode } from "react";

export type Variant = "outline" | "destructive" | "default";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  children: ReactNode;
  /**
   * Busy state. The label stays in place (hidden, so the button keeps its size) while a spinner
   * is overlaid on top, and the button is disabled with `aria-busy`.
   */
  loading?: boolean;
  /** Older spelling of `loading`; either works. */
  isLoading?: boolean;
  /** Read to screen readers while loading (visually the label never changes). Default "Loading". */
  loadingText?: string;
}
