"use client";

import style from "./styles.module.scss";
import { useState } from "react";
import { Input } from "../Input";
import { SVG } from "@/components/svg";

export const SearchInput = () => {
  const [showInput, setShowInput] = useState(false);

  const handleIconClick = () => {
    setShowInput(true);
  };

  const handleInputBlur = () => {
    setShowInput(false);
  };

  return (
    <div>
      {showInput ? (
        <Input
          autoFocus={true}
          onBlur={handleInputBlur}
          leftIcon={<SVG.SearchIcon />}
        />
      ) : (
        <button onClick={handleIconClick}>
          <SVG.SearchIcon />
        </button>
      )}
    </div>
  );
};
