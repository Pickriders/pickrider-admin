"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { Badge, Field, Panel, PanelHeader, Select, cx } from "@/components/kit";
import { useAdminPrefs } from "@/components/kit/prefs";
import { FONTS, fontById, type FontId } from "@/lib/admin/fonts";

/**
 * Settings, Appearance tab: theme and font, saved to the admin's profile so they follow
 * them to any device. The preview is drawn with the live tokens, so it changes the moment
 * a choice is made.
 */
type Mode = "light" | "dark" | "system";

const MODES: { id: Mode; label: string; hint: string; icon: LucideIcon }[] = [
  { id: "light", label: "Light", hint: "Always light", icon: Sun },
  { id: "dark", label: "Dark", hint: "Always dark", icon: Moon },
  { id: "system", label: "System", hint: "Follows your device", icon: Monitor },
];

/**
 * A thumbnail of the shell in one fixed scheme. The admin's dark tokens only apply on the
 * root element, so these use fixed colours on purpose: they show each option, not the
 * current theme.
 */
function ModeThumb({ scheme }: { scheme: "light" | "dark" }) {
  const dark = scheme === "dark";
  return (
    <span aria-hidden className={cx("flex h-full w-full gap-1 p-1.5", dark ? "bg-zinc-900" : "bg-zinc-50")}>
      <span className={cx("w-1/4 rounded", dark ? "bg-zinc-800" : "bg-white")} />
      <span className="flex flex-1 flex-col gap-1">
        <span className={cx("h-1.5 w-2/3 rounded-full", dark ? "bg-zinc-600" : "bg-zinc-300")} />
        <span className={cx("flex-1 rounded", dark ? "bg-zinc-800" : "bg-white")} />
        <span className="h-1.5 w-1/3 rounded-full bg-[#3fa49f]" />
      </span>
    </span>
  );
}

function ModeSwatch({ mode }: { mode: Mode }) {
  return (
    <span className="block h-16 w-full overflow-hidden rounded-lg border border-line">
      {mode === "system" ? (
        <span className="flex h-full">
          <span className="w-1/2 overflow-hidden">
            <ModeThumb scheme="light" />
          </span>
          <span className="w-1/2 overflow-hidden">
            <ModeThumb scheme="dark" />
          </span>
        </span>
      ) : (
        <ModeThumb scheme={mode} />
      )}
    </span>
  );
}

export function AppearanceTab() {
  const prefs = useAdminPrefs();
  const mode: Mode = prefs.theme === "light" || prefs.theme === "dark" ? prefs.theme : "system";
  const showing = prefs.resolvedTheme === "dark" ? "dark" : "light";
  const font = fontById(prefs.fontId);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Panel>
          <PanelHeader title="Theme" subtitle="Saved to your profile, so it follows you to any device" />
          <div className="p-5 pt-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
              {MODES.map((option) => {
                const Icon = option.icon;
                const active = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => prefs.setThemeMode(option.id)}
                    className={cx(
                      "flex flex-col gap-3 rounded-xl border p-3 text-left transition-colors",
                      active ? "border-brand bg-brand-soft" : "border-line hover:bg-surface",
                    )}
                  >
                    <ModeSwatch mode={option.id} />
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cx(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                          active ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted",
                        )}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className={cx("block text-sm font-bold", active ? "text-brand-dark" : "text-ink")}>
                          {option.label}
                        </span>
                        <span className="block text-[11px] text-ink-faint">{option.hint}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-ink-faint">Currently showing {showing}.</p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Font" subtitle="Applies to the whole admin as soon as you pick one" />
          <div className="p-5 pt-4">
            <Field label="Interface font" className="max-w-sm">
              <Select value={prefs.fontId} onChange={(e) => prefs.setFont(e.target.value as FontId)}>
                {FONTS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Panel>
      </div>

      <Panel className="lg:col-span-2">
        <PanelHeader
          title="Preview"
          subtitle={`${showing === "dark" ? "Dark" : "Light"} theme, ${font.label.replace(" (default)", "")}`}
        />
        <div className="p-5 pt-4">
          {/* Drawn with the live tokens: it is the admin as it looks right now. */}
          <div data-testid="appearance-preview" className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line bg-card px-3 py-2">
              <span className="h-2 w-16 rounded-full bg-ink" />
              <span className="flex gap-1.5">
                <span className="h-5 w-5 rounded-full bg-surface ring-1 ring-line" />
                <span className="h-5 w-5 rounded-full bg-ink" />
              </span>
            </div>
            <div className="flex gap-3 p-3">
              <div className="hidden w-16 shrink-0 space-y-1.5 sm:block">
                <span className="block h-5 rounded-md bg-ink" />
                <span className="block h-5 rounded-md bg-card" />
                <span className="block h-5 rounded-md bg-card" />
              </div>
              <div className="min-w-0 flex-1 space-y-3 rounded-xl border border-line bg-card p-3 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Delivered today</p>
                    <p className="text-2xl font-black tracking-tight text-ink">1,234</p>
                  </div>
                  <Badge tone="success" dot>
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-ink-muted">The quick brown rider jumps over the lazy order.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-brand-ink">Primary</span>
                  <span className="rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink">
                    Secondary
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-ink-faint">Headings, body text and numbers all use this font.</p>
        </div>
      </Panel>
    </div>
  );
}
