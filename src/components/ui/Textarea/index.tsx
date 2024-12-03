import { cn } from "@/lib/utils";
import React from "react";

type TextAreaProps = React.InputHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = ({ className, ...props }: TextAreaProps) => {
  return (
    <textarea
      name=""
      id=""
      className={cn(
        "h-20 resize-none  transition-all duration-300  w-full border text-muted-foreground px-2 text-sm font-montserrat font-semibold py-2 rounded-[4px] bg-muted dark:bg-transparent outline-none  border-[#C7CBE0] dark:border-neutral-800 hover:bg-gray-200 focus:hover:bg-muted  dark:hover:bg-transparent focus-visible:ring-ring/40 focus-visible:ring-[3px] ",
        className
      )}
      {...props}
    ></textarea>
  );
};
