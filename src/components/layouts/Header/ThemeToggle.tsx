"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { useAdminPrefs } from "@/components/kit/prefs";

/** Light/dark toggle, saved on the admin's profile. Renders after mount to avoid a hydration mismatch. */
export const ThemeToggle = () => {
  const { resolvedTheme, setThemeMode } = useAdminPrefs();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="h-9 w-9" aria-hidden />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setThemeMode(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card text-ink-muted transition-colors hover:border-brand/40 hover:text-ink"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};
