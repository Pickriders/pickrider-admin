import { SVG } from "@/components/svg";

export const Tag = () => {
  return (
    <div className="bg-muted pr-2 pl-3 rounded-2xl flex items-center justify-between h-9 w-[7.5rem]">
      <span className="truncate font-montserrat text-xs text-foreground font-semibold">
        kester Nnamani
      </span>
      <button className="size-[1.5rem] flex-shrink-0 grid place-items-center rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700/55 transition-colors duration-300">
        <SVG.XIcon width={11} height={11} />
      </button>
    </div>
  );
};
