"use client";

import { SVG } from "@/components/svg";
import { cn } from "@/lib/utils";
import _ from "lodash";
import React from "react";

type TableSearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onSearch?: (text: string) => void;
};

export const TableSearchInput = ({ className, onSearch, value, ...props }: TableSearchInputProps) => {
  const [text, setText] = React.useState(value?.toString() ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSearch = React.useCallback(
    _.debounce((text: string) => {
      const searchText = text.trim();
      if (searchText.length > 2) {
        onSearch?.(searchText);
      } else {
        onSearch?.("");
      }
    }, 800),
    [onSearch],
  );

  React.useEffect(() => {
    debounceSearch?.(text);
  }, [text, debounceSearch]);

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
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};
