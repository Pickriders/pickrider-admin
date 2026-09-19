"use client";

import { Bike, Check, ExternalLink, Layers, MousePointerClick, Save, Send, Users, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Button, ConfirmDialog, Drawer, Field, Input, Select, Textarea, cx } from "@/components/kit";
import {
  AnnouncementActionType,
  AnnouncementAudience,
  AnnouncementStatus,
  announcements,
  type Announcement,
  type AnnouncementInput,
  type AnnouncementUpdate,
} from "@/lib/admin/api";
import { useAction, useAnnouncementScreens } from "@/lib/admin/hooks";
import { count } from "@/lib/admin/format";

import { AnnouncementPreview } from "./announcement-preview";

/**
 * Write or edit a "what's new" popup. Internal links are picked from the screen registry the
 * backend serves (nobody types a route by hand); external links must be https and open in the
 * app's in-app browser. The preview on the right updates as you type.
 */
const TITLE_MAX = 80;
const BODY_MAX = 500;
const LABEL_MAX = 40;
const EMOJI_PICKS = ["🎉", "✨", "🚀", "🧮", "📅", "🎁", "🏅", "💸", "📍", "🛵", "⚡", "🔔"];

type ActionMode = "NONE" | AnnouncementActionType;

const AUDIENCES: { id: AnnouncementAudience; icon: LucideIcon; label: string; hint: string }[] = [
  { id: AnnouncementAudience.CUSTOMERS, icon: Users, label: "Customers", hint: "Pops in the customer app" },
  { id: AnnouncementAudience.RIDERS, icon: Bike, label: "Couriers", hint: "Pops in the rider app" },
];
const BUTTONS: { id: ActionMode; icon: LucideIcon; label: string; hint: string }[] = [
  { id: "NONE", icon: MousePointerClick, label: "Just “Got it”", hint: "No action, closes the popup" },
  { id: AnnouncementActionType.INTERNAL, icon: Layers, label: "Open a screen", hint: "Deep link inside the app" },
  { id: AnnouncementActionType.EXTERNAL, icon: ExternalLink, label: "Open a link", hint: "In the in-app browser" },
];

/** ISO → value a datetime-local input accepts (local time, no seconds). */
function toLocalInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function AnnouncementFormDrawer({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Present when editing; absent when creating. */
  editing?: Announcement | null;
  onSaved?: (saved: Announcement) => void;
}) {
  const [audience, setAudience] = useState<AnnouncementAudience>(AnnouncementAudience.CUSTOMERS);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [imageUrl, setImageUrl] = useState("");
  const [mode, setMode] = useState<ActionMode>("NONE");
  const [screen, setScreen] = useState("");
  const [link, setLink] = useState("");
  const [label, setLabel] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  // Saving an edit resets who-saw-it and re-shows the popup to everyone; the admin confirms first.
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAudience(editing?.audience ?? AnnouncementAudience.CUSTOMERS);
    setTitle(editing?.title ?? "");
    setBody(editing?.body ?? "");
    setEmoji(editing?.emoji ?? (editing?.imageUrl ? "" : "🎉"));
    setImageUrl(editing?.imageUrl ?? "");
    const action = editing?.action;
    setMode(action?.type ?? "NONE");
    setScreen(action?.type === AnnouncementActionType.INTERNAL ? action.target : "");
    setLink(action?.type === AnnouncementActionType.EXTERNAL ? action.target : "");
    setLabel(action?.label ?? "");
    setStartsAt(toLocalInput(editing?.startsAt));
    setEndsAt(toLocalInput(editing?.endsAt));
    setConfirmReset(false);
  }, [open, editing]);

  const screens = useAnnouncementScreens();
  const screenOptions = useMemo(() => screens.data?.[audience] ?? [], [screens.data, audience]);
  // A screen picked for one app is meaningless in the other.
  useEffect(() => {
    if (screen && !screenOptions.some((s) => s.path === screen)) setScreen("");
  }, [screen, screenOptions]);

  const action = useMemo(() => {
    if (mode === "NONE") return null;
    return {
      type: mode,
      label: label.trim(),
      target: mode === AnnouncementActionType.INTERNAL ? screen : link.trim(),
    };
  }, [mode, label, screen, link]);

  const problems: string[] = [];
  if (title.trim().length < 3) problems.push("Title needs at least 3 characters.");
  if (body.trim().length < 5) problems.push("Message needs at least 5 characters.");
  if (imageUrl && !/^https:\/\/\S+$/i.test(imageUrl.trim())) problems.push("Image must be an https:// URL.");
  if (action) {
    if (action.label.length < 2) problems.push("The button needs a label.");
    if (mode === AnnouncementActionType.INTERNAL && !screen) problems.push("Pick the screen to open.");
    if (mode === AnnouncementActionType.EXTERNAL && !/^https:\/\/\S+$/i.test(action.target)) problems.push("The link must be an https:// URL.");
  }
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) problems.push("The end must be after the start.");
  const ready = problems.length === 0;

  const invalidate = ["announcements", "announcement"];
  const create = useAction((input: AnnouncementInput) => announcements.create(input), {
    success: (saved) => (saved.status === AnnouncementStatus.ACTIVE ? "Announcement is live" : "Draft saved"),
    invalidate,
    onSuccess: (saved) => {
      onSaved?.(saved);
      onClose();
    },
  });
  const update = useAction((input: AnnouncementUpdate) => announcements.update(editing!._id!, input), {
    success: "Saved. It will pop again for everyone",
    invalidate,
    onSuccess: (saved) => {
      setConfirmReset(false);
      onSaved?.(saved);
      onClose();
    },
  });
  const busy = create.isPending || update.isPending;

  const submit = (status: AnnouncementStatus.DRAFT | AnnouncementStatus.ACTIVE) => {
    const common = {
      title: title.trim(),
      body: body.trim(),
      audience,
      startsAt: fromLocalInput(startsAt),
      endsAt: fromLocalInput(endsAt),
    };
    if (editing?._id) {
      update.mutate({
        ...common,
        emoji: emoji.trim() || null,
        imageUrl: imageUrl.trim() || null,
        action: action ?? null,
      });
      return;
    }
    create.mutate({
      ...common,
      emoji: emoji.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      action: action ?? undefined,
      status,
      startsAt: common.startsAt ?? undefined,
      endsAt: common.endsAt ?? undefined,
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={editing ? "Edit announcement" : "New announcement"}
      subtitle={editing ? "Changes reach people the next time the app opens." : "Pops on launch for everyone in the audience until they close it for good."}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            {problems.slice(0, 2).map((problem) => (
              <p key={problem} className="text-[11px] font-semibold text-warning">
                {problem}
              </p>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            {editing ? (
              <Button icon={Save} onClick={() => setConfirmReset(true)} disabled={!ready} loading={busy}>
                Save changes
              </Button>
            ) : (
              <>
                <Button variant="outline" icon={Save} onClick={() => submit(AnnouncementStatus.DRAFT)} disabled={!ready} loading={create.isPending}>
                  Save draft
                </Button>
                <Button icon={Send} onClick={() => submit(AnnouncementStatus.ACTIVE)} disabled={!ready} loading={create.isPending}>
                  Publish now
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_17rem]">
        <div className="space-y-6">
          <Section step={1} title="Who sees it" hint="One app per announcement.">
            <Choice label="Which app" value={audience} onChange={setAudience} options={AUDIENCES} />
          </Section>

          <Section step={2} title="What it says" hint="Short and clear; the popup is small.">
            <Field
              label={
                <span className="flex justify-between">
                  <span>Title</span>
                  <span className={cx("font-medium", title.length > TITLE_MAX ? "text-danger" : "text-ink-faint")}>
                    {title.length}/{TITLE_MAX}
                  </span>
                </span>
              }
            >
              <Input value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="Know the price before you order" />
            </Field>
            <Field
              label={
                <span className="flex justify-between">
                  <span>Message</span>
                  <span className={cx("font-medium", body.length > BODY_MAX ? "text-danger" : "text-ink-faint")}>
                    {body.length}/{BODY_MAX}
                  </span>
                </span>
              }
              hint="Two or three short lines work best."
            >
              <Textarea value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} className="min-h-28" placeholder="Try the new price calculator: get an estimate for any trip before you book." />
            </Field>
            <Field label="Emoji" hint="Shown large above the title when there is no image.">
              <div className="flex flex-wrap items-center gap-1.5">
                {EMOJI_PICKS.map((pick) => (
                  <button
                    key={pick}
                    type="button"
                    onClick={() => setEmoji(pick)}
                    className={cx(
                      "grid h-10 w-10 place-items-center rounded-xl border text-lg transition-colors",
                      emoji === pick ? "border-brand bg-brand-soft" : "border-line hover:bg-surface",
                    )}
                    aria-label={`Use ${pick}`}
                  >
                    {pick}
                  </button>
                ))}
                <span className="block w-20">
                  <Input value={emoji} maxLength={8} onChange={(e) => setEmoji(e.target.value)} className="text-center" aria-label="Custom emoji" placeholder="Other" />
                </span>
              </div>
            </Field>
            <Field label="Image URL (optional)" hint="https only; replaces the emoji.">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </Field>
          </Section>

          <Section step={3} title="The button" hint="What happens when they tap it.">
            <Choice label="Button" value={mode} onChange={setMode} options={BUTTONS} />
            {mode !== "NONE" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {mode === AnnouncementActionType.INTERNAL ? (
                  <Field label="Screen" hint={screens.isLoading ? "Loading screens…" : "Only screens that exist in the app are listed."}>
                    <Select value={screen} onChange={(e) => setScreen(e.target.value)} disabled={screens.isLoading}>
                      <option value="">Pick a screen</option>
                      {screenOptions.map((s) => (
                        <option key={s.path} value={s.path}>
                          {s.label}: {s.description}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : (
                  <Field label="Link" hint="Opens inside the app, not in Safari or Chrome.">
                    <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://pickriders.com/blog/…" />
                  </Field>
                )}
                <Field
                  label={
                    <span className="flex justify-between">
                      <span>Button label</span>
                      <span className="font-medium text-ink-faint">
                        {label.length}/{LABEL_MAX}
                      </span>
                    </span>
                  }
                >
                  <Input value={label} maxLength={LABEL_MAX} onChange={(e) => setLabel(e.target.value)} placeholder="Try it now" />
                </Field>
              </div>
            ) : null}
          </Section>

          <Section step={4} title="When it shows" hint="Both optional. Empty means as soon as it is live, until it is archived.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Start showing">
                <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </Field>
              <Field label="Stop showing">
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </Field>
            </div>
          </Section>
        </div>

        <div className="md:sticky md:top-0 md:self-start">
          <AnnouncementPreview emoji={emoji} title={title} body={body} imageUrl={imageUrl.trim() || null} audience={audience} action={action} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => submit(AnnouncementStatus.DRAFT)}
        loading={update.isPending}
        title="Save and show it to everyone again?"
        description={
          editing
            ? `Saving resets this announcement: the ${count(editing.stats?.reached)} people it reached (${count(editing.stats?.acted)} took the action, ${count(editing.stats?.confirmed)} closed it) are forgotten and the corrected popup shows again to everyone in the audience${editing.status === AnnouncementStatus.ACTIVE ? " on their next app open" : " once it is live"}. The counters start from zero.`
            : undefined
        }
        confirmLabel="Save and re-show"
        tone="danger"
      />
    </Drawer>
  );
}

/** A numbered block of the form, so the drawer reads top to bottom as steps. */
function Section({ step, title, hint, children }: { step: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-xs font-black text-card">{step}</span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <p className="text-xs text-ink-muted">{hint}</p>
        </div>
      </div>
      <div className="space-y-4 sm:pl-10">{children}</div>
    </section>
  );
}

/**
 * Labelled cards for a single-choice setting; every card says what picking it
 * means. Two options sit side by side; three or more stack as full-width rows so
 * labels and hints never wrap into a ragged grid in the narrow form column.
 */
function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: { id: T; icon: LucideIcon; label: string; hint: string }[];
}) {
  const stacked = options.length > 2;
  return (
    <div role="radiogroup" aria-label={label} className={cx("grid gap-2", stacked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
      {options.map((option) => {
        const active = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cx(
              "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
              active ? "border-brand bg-brand-soft/60" : "border-line bg-card hover:bg-surface",
            )}
          >
            <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", active ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted")}>
              <Icon size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">{option.label}</span>
              <span className="block text-xs leading-snug text-ink-muted">{option.hint}</span>
            </span>
            <span
              className={cx(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                active ? "border-brand bg-brand text-brand-ink" : "border-line-strong bg-card text-transparent",
              )}
              aria-hidden
            >
              <Check size={12} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
