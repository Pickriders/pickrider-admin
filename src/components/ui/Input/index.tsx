"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { InputProps } from "./Input.type";
import { Button } from "../Button";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      labelValue,
      errorMessage,
      rightIcon,
      leftIcon,
      id,
      labelClassName,
      showToggle,
      ...props
    },
    ref
  ) => {
    const [inputType, setInputType] = React.useState(type);
    const toggleViewPassword = () => {
      setInputType(inputType === "password" ? "text" : "password");
    };

    return (
      <div className="flex flex-col gap-y-1.5 ">
        {labelValue && (
          <label
            htmlFor={id}
            className={cn(
              "text-primary-gray font-montserrat font-semibold text-xs",
              labelClassName
            )}
          >
            {labelValue}
          </label>
        )}
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            {leftIcon}
          </span>
          <input
            type={inputType}
            className={cn(
              "peer flex h-9 w-full  rounded-lg font-clash-display border border-input bg-transparent px-3 py-1 text-primary-gray font-semibold  shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 duration-200  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className,
              leftIcon ? "pl-10" : "",
              rightIcon && "pr-14"
            )}
            ref={ref}
            id={id}
            {...props}
          />
          {type === "password" && showToggle && (
            <Button
              type="button"
              variant={"ghost"}
              className="absolute opacity-30    peer-placeholder-shown:invisible overflow-hidden right-2 top-1/2 -translate-y-1/2"
              onClick={toggleViewPassword}
            >
              {inputType === "password" ? (
                <Eye size={18} />
              ) : (
                <EyeOff size={18} />
              )}
            </Button>
          )}
          {rightIcon && (
            <span className=" absolute right-2 top-1/2 -translate-y-1/2">
              {rightIcon}
            </span>
          )}
        </div>
        {errorMessage && (
          <span className="text-destructive font-montserrat text-xs font-semibold">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
