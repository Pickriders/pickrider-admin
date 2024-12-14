import { cn } from "@/lib/utils";

interface TextAreaWithCounterProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  height?: string;
}

export const TextAreaWithCounter = ({
  value,
  setValue,
  maxLength = 500,
  label = "Message",
  placeholder = "Write message",
  height = "h-32",
}: TextAreaWithCounterProps) => {
  const valueLength = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center text-xs font-semibold font-montserrat justify-between">
        <label htmlFor="textarea-input">{label}</label>
        <span>
          {valueLength} / {maxLength}
        </span>
      </div>
      <textarea
        id="textarea-input"
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className={cn(
          `resize-none transition-all duration-300 w-full border-[1.5px] text-muted-foreground px-2 text-sm font-montserrat font-semibold py-2 rounded-[4px] bg-muted dark:bg-transparent outline-none border-[#C7CBE0] dark:border-neutral-800 hover:bg-gray-200 focus:hover:bg-muted dark:hover:bg-transparent focus-visible:ring-[3px] ${height}`,
          valueLength === maxLength
            ? "focus-visible:ring-destructive"
            : "focus-visible:ring-ring/40"
        )}
      ></textarea>
    </div>
  );
};
