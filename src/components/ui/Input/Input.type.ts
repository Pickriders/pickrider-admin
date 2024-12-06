export interface InputProps extends React.ComponentProps<"input"> {
  labelValue?: string;
  errorMessage?: string;
  rightIcon?: React.ReactNode;
  labelClassName?: string;
}
