"use client";

import { SVG } from "@/components/svg";
import { cn } from "@/lib/utils";
import _ from "lodash";
import React from "react";

type TableSearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onSearch?: (text: string) => void;
};

const normalize = (raw: string) => {
  const s = raw.trim();
  return s.length > 2 ? s : "";
};

export const TableSearchInput = ({ className, onSearch, value, ...props }: TableSearchInputProps) => {
  const [text, setText] = React.useState(value?.toString() ?? "");

  // Keep the latest onSearch without making the debounced fn (or the effect)
  // depend on its identity — the callers pass a fresh inline arrow every render,
  // which previously re-created the debouncer and re-fired onSearch on EVERY
  // render (causing a navigation loop). We also only emit when the normalized
  // value actually changes, so re-renders never trigger a spurious search.
  const onSearchRef = React.useRef(onSearch);
  onSearchRef.current = onSearch;
  const lastEmitted = React.useRef<string>(normalize(value?.toString() ?? ""));

  const debounced = React.useMemo(
    () =>
      _.debounce((raw: string) => {
        const out = normalize(raw);
        if (out === lastEmitted.current) return;
        lastEmitted.current = out;
        onSearchRef.current?.(out);
      }, 450),
    [],
  );

  React.useEffect(() => {
    debounced(text);
  }, [text, debounced]);

  React.useEffect(() => () => debounced.cancel(), [debounced]);

  return (
    <div className="relative flex items-center">
      <span className="absolute left-4">
        <SVG.SearchIcon />
      </span>
      <input
        type="text"
        placeholder="Search"
        className={cn(
          "w-[20rem] outline-none text-sm text-primary-gray dark:hover:bg-zinc-800 focus:dark:bg-zinc-900 pl-12 rounded-full pr-3 dark:bg-zinc-900 hover:bg-gray-200 focus:hover:bg-muted transition-all duration-300  bg-muted py-2.5 font-semibold font-montserrat",
          className,
        )}
        value={text}
        onChange={(e) => setText(e.target.value)}
        {...props}
      />
    </div>
  );
};
