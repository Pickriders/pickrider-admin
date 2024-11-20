import { SVG } from "@/components/svg";
import React from "react";

type TableSearchInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TableSearchInput = ({ ...props }: TableSearchInputProps) => {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-4">
        <SVG.SearchIcon />
      </span>
      <input
        type="text"
        placeholder="Search"
        className="w-[20rem] outline-none text-sm text-primary-gray dark:hover:bg-zinc-800 focus:dark:bg-zinc-900 pl-12 rounded-full pr-3 dark:bg-zinc-900 hover:bg-gray-200 focus:hover:bg-muted transition-all duration-300  bg-muted py-2.5 font-semibold font-montserrat"
        {...props}
      />
    </div>
  );
};
