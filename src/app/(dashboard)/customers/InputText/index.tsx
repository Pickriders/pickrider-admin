import { cn } from "@/lib/utils";

interface InputTextProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export const InputText = ({ value, setValue }: InputTextProps) => {
  const valueLength = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center text-xs font-semibold font-montserrat justify-between">
        <label htmlFor="title">Title</label>
        <span>{valueLength} / 40</span>
      </div>
      <input
        type="text"
        id="title"
        maxLength={40}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write title"
        className={cn(
          "transition-all duration-300 w-full border-[1.5px] text-muted-foreground px-2 text-sm font-montserrat font-semibold py-2.5 rounded-[4px] bg-muted dark:bg-transparent outline-none border-[#C7CBE0] dark:border-neutral-800 hover:bg-gray-200 focus:hover:bg-muted  dark:hover:bg-transparent focus-visible:ring-[3px] ",
          value.length === 40
            ? "focus-visible:ring-destructive "
            : "focus-visible:ring-ring/40"
        )}
      />
    </div>
  );
};
