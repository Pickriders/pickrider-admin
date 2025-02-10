import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className, children, ...props }: LabelProps) => {
  return (
    <label
      htmlFor="remeber me"
      className={cn(
        "font-semibold font-montserrat text-primary-gray text-sm",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};
