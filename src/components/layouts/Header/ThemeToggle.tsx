"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/** Light/dark toggle. Renders after mount to avoid a hydration mismatch. */
export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="size-9" aria-hidden />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="size-9 grid place-items-center rounded-lg border bg-background text-primary-gray transition-colors hover:text-foreground"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};
