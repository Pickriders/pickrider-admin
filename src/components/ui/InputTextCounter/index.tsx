import { cn } from "@/lib/utils";

interface TextInputProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  maxLength?: number;
  label?: string;
  placeholder?: string;
}

export const TextInputWithCounter = ({
  value,
  setValue,
  maxLength = 40,
  label = "Title",
  placeholder = "Write title",
}: TextInputProps) => {
  const valueLength = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center text-xs font-semibold font-montserrat justify-between">
        <label htmlFor="text-input">{label}</label>
        <span>
          {valueLength} / {maxLength}
        </span>
      </div>
      <input
        type="text"
        id="text-input"
        maxLength={maxLength}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "transition-all duration-300 w-full border-[1.5px] text-muted-foreground px-2 text-sm font-montserrat font-semibold py-2.5 rounded-[4px] bg-muted dark:bg-transparent outline-none border-[#C7CBE0] dark:border-neutral-800 hover:bg-gray-200 focus:hover:bg-muted dark:hover:bg-transparent focus-visible:ring-[3px]",
          valueLength === maxLength
            ? "focus-visible:ring-destructive"
            : "focus-visible:ring-ring/40"
        )}
      />
    </div>
  );
};
