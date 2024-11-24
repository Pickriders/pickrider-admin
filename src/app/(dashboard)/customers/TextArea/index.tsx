import { cn } from "@/lib/utils";
import { useState } from "react";

interface TextAreaProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export const TextArea = ({ setValue, value }: TextAreaProps) => {
  const valueLength = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center text-xs font-semibold font-montserrat justify-between">
        <label htmlFor="push-message">Message</label>
        <span>{valueLength} / 500</span>
      </div>
      <textarea
        id="push-message"
        placeholder="Write message"
        maxLength={500}
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className={cn(
          "h-32 resize-none  transition-all duration-300  w-full border-[1.5px] text-muted-foreground px-2 text-sm font-montserrat font-semibold py-2 rounded-[4px] bg-muted dark:bg-transparent outline-none  border-[#C7CBE0] dark:border-neutral-800 hover:bg-gray-200 focus:hover:bg-muted  dark:hover:bg-transparent focus-visible:ring-[3px] ",
          valueLength === 500
            ? "focus-visible:ring-destructive "
            : "focus-visible:ring-ring/40"
        )}
      ></textarea>
    </div>
  );
};
