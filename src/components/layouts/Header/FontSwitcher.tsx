"use client";

import * as React from "react";
import { Check, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

const FONT_KEY = "pickriders-admin-font";

// Mirrors the storefront's selectable fonts (src/lib/theme.ts). Default =
// Urbanist, matching the storefront's default face.
const FONTS = [
  { id: "default", label: "Urbanist (default)", family: "var(--font-urbanist), Urbanist, sans-serif" },
  { id: "rubik", label: "Rubik", family: "Rubik, sans-serif" },
  { id: "faktum", label: "Faktum", family: "var(--font-faktum-test), sans-serif" },
  { id: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
  { id: "inter", label: "Inter", family: "Inter, sans-serif" },
  { id: "barlow", label: "Barlow", family: "Barlow, sans-serif" },
  { id: "quicksand", label: "Quicksand", family: "Quicksand, sans-serif" },
  { id: "saira", label: "Saira", family: "Saira, sans-serif" },
  { id: "poppins", label: "Poppins", family: "Poppins, sans-serif" },
  { id: "montserrat", label: "Montserrat", family: "Montserrat, sans-serif" },
  { id: "work-sans", label: "Work Sans", family: "'Work Sans', sans-serif" },
  { id: "dm-sans", label: "DM Sans", family: "'DM Sans', sans-serif" },
  { id: "roboto", label: "Roboto", family: "Roboto, sans-serif" },
  { id: "karla", label: "Karla", family: "Karla, sans-serif" },
  { id: "pt-sans", label: "PT Sans", family: "'PT Sans', sans-serif" },
  { id: "julius-sans-one", label: "Julius Sans One", family: "'Julius Sans One', sans-serif" },
  { id: "biorhyme", label: "BioRhyme", family: "BioRhyme, serif" },
] as const;

type FontId = (typeof FONTS)[number]["id"];

function applyFont(id: FontId) {
  const font = FONTS.find((entry) => entry.id === id) ?? FONTS[0];
  // The whole app reads --admin-font (see tailwind fontFamily.sans + globals).
  document.documentElement.style.setProperty("--admin-font", font.family);
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
          className="size-9 grid place-items-center rounded-xl border bg-background text-primary-gray transition-colors hover:text-foreground hover:border-primary/40"
        >
          <Type size={17} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-primary-gray">
          Interface font
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FONTS.map((font) => (
          <DropdownMenuItem
            key={font.id}
            onClick={() => select(font.id)}
            className="flex items-center justify-between rounded-lg py-2"
            style={{ fontFamily: font.family }}
          >
            <span className="text-sm">{font.label}</span>
            {fontId === font.id ? <Check size={14} className="text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
