"use client";

import { useTheme } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { me, type AdminPreferences } from "@/lib/admin/api";
import { applyFont, type FontId } from "@/lib/admin/fonts";

/**
 * Theme and font for the signed-in admin. The server copy on the profile is
 * the truth; localStorage (next-themes for theme, one key for the font) is a
 * cache so the first paint after a reload does not flash the wrong look while
 * the profile loads.
 */
const FONT_KEY = "pickriders-admin-font";

type PrefsValue = {
  fontId: string;
  setFont: (id: FontId) => void;
  theme: string | undefined;
  resolvedTheme: string | undefined;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
};

const PrefsContext = createContext<PrefsValue | null>(null);

export function AdminPrefsProvider({ children }: { children: ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [fontId, setFontId] = useState<string>("default");

  // Cache first, then the server copy overrides once it lands.
  useEffect(() => {
    let cached: string | null = null;
    try {
      cached = window.localStorage.getItem(FONT_KEY);
    } catch {
      // storage blocked; server copy still applies below
    }
    if (cached) {
      setFontId(cached);
      applyFont(cached);
    }
    let cancelled = false;
    me.preferences()
      .then((prefs: AdminPreferences) => {
        if (cancelled || !prefs) return;
        if (prefs.font) {
          setFontId(prefs.font);
          applyFont(prefs.font);
          try {
            window.localStorage.setItem(FONT_KEY, prefs.font);
          } catch {
            // ignore
          }
        }
        if (prefs.theme) setTheme(prefs.theme);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFont = useCallback((id: FontId) => {
    setFontId(id);
    applyFont(id);
    try {
      window.localStorage.setItem(FONT_KEY, id);
    } catch {
      // ignore
    }
    void me.updatePreferences({ font: id }).catch(() => undefined);
  }, []);

  const setThemeMode = useCallback(
    (mode: "light" | "dark" | "system") => {
      setTheme(mode);
      void me.updatePreferences({ theme: mode }).catch(() => undefined);
    },
    [setTheme],
  );

  const value = useMemo<PrefsValue>(
    () => ({ fontId, setFont, theme, resolvedTheme, setThemeMode }),
    [fontId, setFont, theme, resolvedTheme, setThemeMode],
  );
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function useAdminPrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("useAdminPrefs must be used inside AdminPrefsProvider");
  return ctx;
}
