import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  labelValue?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, labelValue, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-y-1.5">
        {labelValue && (
          <label
            htmlFor={id}
            className="text-primary-gray font-clash-display font-semibold text-xs"
          >
            {labelValue}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg font-clash-display border border-input bg-transparent px-3 py-1 text-primary-gray font-semibold  shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px]  duration-200 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          id={id}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
