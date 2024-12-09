export interface InputProps extends React.ComponentProps<"input"> {
  labelValue?: string;
  errorMessage?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  labelClassName?: React.HTMLAttributes<HTMLLabelElement>["className"];
  showToggle?: boolean;
}
