"use client";

import { ArrowUpDown, Check, ChevronDown, MoreHorizontal, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cx } from "@/components/kit/primitives";

/**
 * The admin's custom dropdown menu. One engine, three shapes:
 *
 * - `Menu`: the general version. A trigger plus sections of items (radio, checkbox or plain
 *   actions), portalled to <body> so a table or a card never clips it.
 * - `MenuSelect`: one choice from a list, e.g. "Sort: Most orders".
 * - `MenuFilters`: several toggles with a count and a Clear action, e.g. "Filters (2)".
 * - `ActionMenu`: a "More" button for secondary actions, with a separated danger section.
 *
 * Anchored under (or above, when there is no room) its trigger from `sm` up; a bottom sheet on
 * phones. Closes on outside click, Escape and Tab; arrow keys, Home and End move between items.
 */

// ── Media query ───────────────────────────────────────────────────────────────

/** True while the query matches. False on the server and on the first client render. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const list = window.matchMedia(query);
    const sync = () => setMatches(list.matches);
    sync();
    list.addEventListener("change", sync);
    return () => list.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MenuTone = "neutral" | "warning" | "danger" | "success";

export type MenuItem = {
  id: string;
  label: ReactNode;
  /** Plain text for type-ahead and screen readers when `label` is not a string. */
  textValue?: string;
  icon?: LucideIcon;
  /** Small muted line under the label. */
  hint?: ReactNode;
  /** A count pill at the end of the row (e.g. licences awaiting review). */
  count?: ReactNode;
  tone?: MenuTone;
  /** Radio and checkbox sections only. */
  checked?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export type MenuSection = {
  id: string;
  label?: ReactNode;
  /** radio: one checked item; checkbox: any number, menu stays open; action: closes on pick. */
  kind?: "radio" | "checkbox" | "action";
  items: MenuItem[];
};

export type MenuTriggerProps = {
  ref: RefObject<HTMLButtonElement>;
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
};

const ITEM_TONE: Record<MenuTone, { text: string; icon: string }> = {
  neutral: { text: "text-ink", icon: "text-ink-muted" },
  warning: { text: "text-ink", icon: "text-warning" },
  danger: { text: "text-danger", icon: "text-danger" },
  success: { text: "text-success", icon: "text-success" },
};

const GAP = 6;
const EDGE = 8;

// ── Engine ────────────────────────────────────────────────────────────────────

export function Menu({
  trigger,
  sections,
  title,
  footer,
  align = "start",
  minWidth = 240,
  sheet = true,
  label,
}: {
  /** Render the trigger and spread the props onto a button. */
  trigger: (props: MenuTriggerProps, open: boolean) => ReactNode;
  sections: MenuSection[];
  /** Heading on the phone sheet; also the menu's accessible name when `label` is absent. */
  title?: ReactNode;
  /** Pinned under the items, e.g. a Clear button. Receives `close`. */
  footer?: (close: () => void) => ReactNode;
  align?: "start" | "end";
  minWidth?: number;
  /** Bottom sheet under `sm`. */
  sheet?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    above: boolean;
  } | null>(null);
  const phone = useMediaQuery("(max-width: 639px)");
  const asSheet = sheet && phone;
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;
  const focusFirstOnOpen = useRef<"selected" | "first" | "last">("selected");

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const place = useCallback(() => {
    const button = triggerRef.current;
    const panel = panelRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(Math.max(rect.width, minWidth), vw - EDGE * 2);
    // The list's full height plus the footer, not the panel's current (possibly capped) height.
    const natural = panel
      ? Array.from(panel.children).reduce((sum, el) => sum + (el as HTMLElement).scrollHeight, 2)
      : 320;
    const below = vh - rect.bottom - GAP - EDGE;
    const aboveSpace = rect.top - GAP - EDGE;
    const above = natural > below && aboveSpace > below;
    const maxHeight = Math.max(160, above ? aboveSpace : below);
    const height = Math.min(natural, maxHeight);
    let left = align === "end" ? rect.right - width : rect.left;
    left = Math.min(Math.max(EDGE, left), vw - width - EDGE);
    const top = above ? rect.top - GAP - height : rect.bottom + GAP;
    setPos((prev) =>
      prev &&
      prev.top === top &&
      prev.left === left &&
      prev.width === width &&
      prev.maxHeight === maxHeight &&
      prev.above === above
        ? prev
        : { top, left, width, maxHeight, above },
    );
  }, [align, minWidth]);

  // Position before paint, then follow the panel's own size (a count or a hint can change it).
  useLayoutEffect(() => {
    if (!open || asSheet) return;
    place();
    const panel = panelRef.current;
    if (!panel || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => place());
    observer.observe(panel.firstElementChild ?? panel);
    return () => observer.disconnect();
  }, [open, asSheet, place]);

  useEffect(() => {
    if (!open || asSheet) return;
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, asSheet, place]);

  // Outside press closes. The sheet has its own backdrop.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  // The sheet locks the page behind it, like the drawer.
  useEffect(() => {
    if (!open || !asSheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, asSheet]);

  const items = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>("[data-menu-item]:not([disabled])") ?? []);

  // Move focus into the menu: the checked option when there is one, else the first.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      const list = items();
      if (!list.length) return panelRef.current?.focus();
      const mode = focusFirstOnOpen.current;
      const selected = list.find((el) => el.getAttribute("aria-checked") === "true");
      const target = mode === "last" ? list[list.length - 1] : mode === "selected" ? (selected ?? list[0]) : list[0];
      target.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const toggle = () => {
    focusFirstOnOpen.current = "selected";
    setOpen((v) => !v);
  };

  const onTriggerKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusFirstOnOpen.current = event.key === "ArrowUp" ? "last" : "selected";
      setOpen(true);
    }
  };

  const onPanelKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => list[(i + list.length) % list.length]?.focus();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index < 0 ? list.length - 1 : index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(list.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        // The panel lives at the end of <body>; hand focus back to the trigger rather than the browser chrome.
        event.preventDefault();
        close();
        break;
      default:
        // Type-ahead: jump to the next item starting with the typed letter.
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const key = event.key.toLowerCase();
          const start = index + 1;
          for (let step = 0; step < list.length; step++) {
            const el = list[(start + step) % list.length];
            if ((el.dataset.text ?? el.textContent ?? "").trim().toLowerCase().startsWith(key)) {
              el.focus();
              break;
            }
          }
        }
    }
  };

  const triggerProps: MenuTriggerProps = {
    ref: triggerRef,
    id: triggerId,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: toggle,
    onKeyDown: onTriggerKey,
  };

  const visible = sections.filter((s) => s.items.length);

  const list = (
    <div className={cx("admin-scroll overflow-y-auto overscroll-contain p-1.5", asSheet && "pb-2")}>
      {visible.map((section, sIndex) => {
        const kind = section.kind ?? "action";
        return (
          <div key={section.id} role="group" aria-label={typeof section.label === "string" ? section.label : undefined}>
            {sIndex > 0 ? <div className="mx-1.5 my-1.5 h-px bg-line" role="separator" /> : null}
            {section.label ? (
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                {section.label}
              </p>
            ) : null}
            {section.items.map((item) => {
              const tone = ITEM_TONE[item.tone ?? "neutral"];
              const Icon = item.icon;
              const role = kind === "radio" ? "menuitemradio" : kind === "checkbox" ? "menuitemcheckbox" : "menuitem";
              const checkable = kind !== "action";
              return (
                <button
                  key={item.id}
                  type="button"
                  role={role}
                  data-menu-item
                  data-text={item.textValue ?? (typeof item.label === "string" ? item.label : undefined)}
                  aria-checked={checkable ? Boolean(item.checked) : undefined}
                  disabled={item.disabled}
                  tabIndex={-1}
                  onClick={() => {
                    item.onSelect();
                    if (kind !== "checkbox") close();
                  }}
                  className={cx(
                    "group flex w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-sm outline-none transition-colors",
                    asSheet ? "min-h-11 py-2" : "min-h-9 py-1.5",
                    "hover:bg-surface focus-visible:bg-surface disabled:cursor-not-allowed disabled:opacity-50",
                    item.checked && kind === "radio" && "bg-surface/70",
                    item.tone === "danger" && "hover:bg-danger-soft focus-visible:bg-danger-soft",
                  )}
                >
                  {kind === "checkbox" ? (
                    <span
                      aria-hidden
                      className={cx(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
                        item.checked ? "border-ink bg-ink text-card" : "border-line-strong bg-card",
                      )}
                    >
                      {item.checked ? <Check size={11} strokeWidth={3} /> : null}
                    </span>
                  ) : null}
                  {Icon ? <Icon size={15} aria-hidden className={cx("shrink-0", tone.icon)} /> : null}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cx(
                        "block truncate font-semibold",
                        tone.text,
                        item.checked && kind === "radio" && "text-ink",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.hint ? (
                      <span className="block truncate text-[11px] font-medium text-ink-faint">{item.hint}</span>
                    ) : null}
                  </span>
                  {item.count != null && item.count !== "" && item.count !== 0 ? (
                    <span
                      className={cx(
                        "shrink-0 rounded-full px-1.5 text-[11px] font-bold tabular-nums leading-5",
                        item.tone === "warning" ? "bg-warning-soft text-warning" : "bg-line text-ink-muted",
                      )}
                    >
                      {item.count}
                    </span>
                  ) : null}
                  {kind === "radio" ? (
                    <Check
                      size={15}
                      aria-hidden
                      className={cx(
                        "shrink-0 text-brand-dark transition-opacity",
                        item.checked ? "opacity-100" : "opacity-0",
                      )}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const accessibleName = label ?? (typeof title === "string" ? title : undefined);

  const panel =
    !open || typeof document === "undefined"
      ? null
      : asSheet
        ? createPortal(
            <div className="fixed inset-0 z-[55]">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] admin-fade-in"
                onClick={() => close()}
                aria-hidden
              />
              <div
                ref={panelRef}
                id={menuId}
                role="menu"
                aria-label={accessibleName}
                aria-labelledby={accessibleName ? undefined : triggerId}
                tabIndex={-1}
                onKeyDown={onPanelKey}
                className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-3xl border border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-pop outline-none admin-fade-up"
              >
                <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" aria-hidden />
                <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-2">
                  <p className="text-sm font-black tracking-tight text-ink">{title}</p>
                  <button
                    type="button"
                    onClick={() => close()}
                    aria-label="Close"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                </div>
                {list}
                {footer ? <div className="border-t border-line px-3 py-2.5">{footer(() => close())}</div> : null}
              </div>
            </div>,
            document.body,
          )
        : createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="menu"
              aria-label={accessibleName}
              aria-labelledby={accessibleName ? undefined : triggerId}
              tabIndex={-1}
              onKeyDown={onPanelKey}
              style={{
                position: "fixed",
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                width: pos?.width ?? minWidth,
                maxHeight: pos?.maxHeight,
                visibility: pos ? "visible" : "hidden",
              }}
              className={cx(
                "z-[55] flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-pop outline-none",
                pos?.above ? "origin-bottom" : "origin-top",
                "admin-pop-in",
              )}
            >
              {list}
              {footer ? <div className="border-t border-line px-2 py-1.5">{footer(() => close())}</div> : null}
            </div>,
            document.body,
          );

  return (
    <>
      {trigger(triggerProps, open)}
      {panel}
    </>
  );
}

// ── Trigger button ────────────────────────────────────────────────────────────

/** The compact outline button the menus open from. `active` tints it when a filter is on. */
export const MenuButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon; active?: boolean; open?: boolean; chevron?: boolean }
>(function MenuButton({ icon: Icon, active, open, chevron = true, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        "inline-flex h-10 min-w-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        active
          ? "border-transparent bg-brand-soft text-brand-dark"
          : "border-line-strong bg-card text-ink hover:bg-surface",
        open && !active && "bg-surface",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <Icon size={15} aria-hidden className={cx("shrink-0", active ? "text-brand-dark" : "text-ink-muted")} />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
      {chevron ? (
        <ChevronDown
          size={15}
          aria-hidden
          className={cx("shrink-0 text-ink-faint transition-transform", open && "rotate-180")}
        />
      ) : null}
    </button>
  );
});

// ── Single choice ─────────────────────────────────────────────────────────────

export type MenuOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  hint?: ReactNode;
  count?: ReactNode;
};

export function MenuSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  icon = ArrowUpDown,
  placeholder = "Any",
  title,
  className,
  align,
}: {
  /** Prefix on the button, e.g. "Sort" reads "Sort: Most orders". */
  label: string;
  value: T | undefined;
  options: MenuOption<T>[];
  onChange: (value: T) => void;
  icon?: LucideIcon;
  /** Button text when `value` matches no option. */
  placeholder?: string;
  title?: string;
  className?: string;
  align?: "start" | "end";
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Menu
      title={title ?? label}
      align={align}
      trigger={(props, open) => (
        <MenuButton
          {...props}
          icon={icon}
          open={open}
          className={className}
          aria-label={`${label}: ${current?.label ?? placeholder}`}
        >
          <span className="font-medium text-ink-muted">{label}:</span> {current?.label ?? placeholder}
        </MenuButton>
      )}
      sections={[
        {
          id: "options",
          kind: "radio",
          items: options.map((o) => ({
            id: o.value,
            label: o.label,
            icon: o.icon,
            hint: o.hint,
            count: o.count,
            checked: o.value === value,
            onSelect: () => onChange(o.value),
          })),
        },
      ]}
    />
  );
}

// ── Several toggles ───────────────────────────────────────────────────────────

export type MenuToggle = {
  id: string;
  label: string;
  icon?: LucideIcon;
  hint?: ReactNode;
  count?: ReactNode;
  tone?: MenuTone;
  active: boolean;
  onToggle: () => void;
};

export function MenuFilters({
  label = "Quick filters",
  title,
  toggles,
  onClear,
  className,
  align,
}: {
  label?: string;
  title?: string;
  toggles: MenuToggle[];
  /** Turns every toggle off. */
  onClear: () => void;
  className?: string;
  align?: "start" | "end";
}) {
  const on = toggles.filter((t) => t.active).length;
  return (
    <Menu
      title={title ?? label}
      align={align}
      trigger={(props, open) => (
        <MenuButton
          {...props}
          icon={SlidersHorizontal}
          open={open}
          active={on > 0}
          className={className}
          aria-label={on ? `${label}, ${on} on` : label}
        >
          {label}
          {on ? <span className="ml-1 tabular-nums">({on})</span> : null}
        </MenuButton>
      )}
      sections={[
        {
          id: "toggles",
          kind: "checkbox",
          items: toggles.map((t) => ({
            id: t.id,
            label: t.label,
            icon: t.icon,
            hint: t.hint,
            count: t.count,
            tone: t.tone,
            checked: t.active,
            onSelect: t.onToggle,
          })),
        },
      ]}
      footer={(close) => (
        <div className="flex items-center justify-between gap-2">
          <span className="pl-1 text-xs text-ink-faint">{on ? `${on} on` : "None on"}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClear}
              disabled={!on}
              className="h-8 rounded-lg px-3 text-xs font-bold text-ink-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={close}
              className="h-8 rounded-lg bg-ink px-3 text-xs font-bold text-card transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    />
  );
}

// ── Actions ───────────────────────────────────────────────────────────────────

export function ActionMenu({
  sections,
  label = "More",
  title = "More actions",
  align = "end",
  className,
  iconOnly,
}: {
  sections: MenuSection[];
  label?: string;
  title?: string;
  align?: "start" | "end";
  className?: string;
  /** Square icon button instead of "More". */
  iconOnly?: boolean;
}) {
  if (!sections.some((s) => s.items.length)) return null;
  return (
    <Menu
      title={title}
      align={align}
      minWidth={232}
      trigger={(props, open) =>
        iconOnly ? (
          <button
            {...props}
            type="button"
            aria-label={title}
            className={cx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line-strong bg-card text-ink-muted transition-colors hover:bg-surface hover:text-ink",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
              open && "bg-surface text-ink",
              className,
            )}
          >
            <MoreHorizontal size={16} />
          </button>
        ) : (
          <MenuButton {...props} icon={MoreHorizontal} open={open} className={className}>
            {label}
          </MenuButton>
        )
      }
      sections={sections}
    />
  );
}
