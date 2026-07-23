"use client";

import * as React from "react";
import { Check, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

const FONT_KEY = "pickriders-admin-font";

const FONTS = [
  { id: "default", label: "Inter (default)", family: "" },
  { id: "clash", label: "Clash Display", family: "var(--font-clash-display)" },
  { id: "montserrat", label: "Montserrat", family: "var(--font-montserrat)" },
  { id: "faktum", label: "Faktum", family: "var(--font-faktum-test)" },
] as const;

type FontId = (typeof FONTS)[number]["id"];

function applyFont(id: FontId) {
  const font = FONTS.find((entry) => entry.id === id) ?? FONTS[0];
  if (font.family) document.body.style.setProperty("font-family", font.family);
  else document.body.style.removeProperty("font-family");
}

/** Base-font picker, persisted per device. Section headings keep their own faces. */
export const FontSwitcher = () => {
  const [fontId, setFontId] = React.useState<FontId>("default");

  React.useEffect(() => {
    const saved = (window.localStorage.getItem(FONT_KEY) as FontId | null) ?? "default";
    setFontId(saved);
    applyFont(saved);
  }, []);

  const select = (id: FontId) => {
    setFontId(id);
    window.localStorage.setItem(FONT_KEY, id);
    applyFont(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change font"
          className="size-9 grid place-items-center rounded-lg border bg-background text-primary-gray transition-colors hover:text-foreground"
        >
          <Type size={17} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {FONTS.map((font) => (
          <DropdownMenuItem
            key={font.id}
            onClick={() => select(font.id)}
            className="flex items-center justify-between"
            style={font.family ? { fontFamily: font.family } : undefined}
          >
            {font.label}
            {fontId === font.id ? <Check size={14} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
