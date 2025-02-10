"use client";

import { useState } from "react";
import { Input } from "../Input";
import { SVG } from "@/components/svg";

export const TableSearchInput = ({
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [showInput, setShowInput] = useState(false);

  const handleIconClick = () => {
    setShowInput(true);
  };

  const handleInputClose = () => {
    setShowInput(false);
  };

  return (
    <div>
      {showInput ? (
        <Input
          autoFocus={true}
          leftIcon={
            <button onClick={handleInputClose}>
              <SVG.XIcon />
            </button>
          }
          {...rest}
        />
      ) : (
        <button onClick={handleIconClick}>
          <SVG.SearchIcon />
        </button>
      )}
    </div>
  );
};
