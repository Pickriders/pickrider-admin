"use client";

import { Save, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button, Drawer, Field, Input, Select, Textarea, cx } from "@/components/kit";
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

const AUDIENCES: { id: AnnouncementAudience; label: string; hint: string }[] = [
  { id: AnnouncementAudience.CUSTOMERS, label: "Customers", hint: "Pops in the customer app" },
  { id: AnnouncementAudience.RIDERS, label: "Couriers", hint: "Pops in the rider app" },
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
    success: "Announcement updated",
    invalidate,
    onSuccess: (saved) => {
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
              <Button icon={Save} onClick={() => submit(AnnouncementStatus.DRAFT)} disabled={!ready} loading={busy}>
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
        <div className="space-y-5">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink-muted">Which app</p>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCES.map((item) => {
                const active = item.id === audience;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAudience(item.id)}
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active ? "border-transparent bg-ink text-card" : "border-line bg-card hover:bg-surface",
                    )}
                  >
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className={cx("block text-[11px]", active ? "text-card/70" : "text-ink-muted")}>{item.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
            hint="Two or three short lines work best; the popup is small."
          >
            <Textarea value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} className="min-h-28" placeholder="Try the new price calculator — get an estimate for any trip before you book." />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
            <Field label="Emoji" hint="Shown large above the title when there is no image">
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_PICKS.map((pick) => (
                  <button
                    key={pick}
                    type="button"
                    onClick={() => setEmoji(pick)}
                    className={cx(
                      "grid h-9 w-9 place-items-center rounded-lg border text-lg transition-colors",
                      emoji === pick ? "border-brand bg-brand-soft" : "border-line hover:bg-surface",
                    )}
                    aria-label={`Use ${pick}`}
                  >
                    {pick}
                  </button>
                ))}
                <Input value={emoji} maxLength={8} onChange={(e) => setEmoji(e.target.value)} className="w-16 text-center" aria-label="Custom emoji" />
              </div>
            </Field>
            <Field label="Image URL (optional)" hint="https only; replaces the emoji">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink-muted">Button</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "NONE", label: "Just “Got it”", hint: "No action, closes the popup" },
                  { id: AnnouncementActionType.INTERNAL, label: "Open a screen", hint: "Deep-link inside the app" },
                  { id: AnnouncementActionType.EXTERNAL, label: "Open a link", hint: "In the in-app browser" },
                ] as { id: ActionMode; label: string; hint: string }[]
              ).map((item) => {
                const active = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-left transition-colors",
                      active ? "border-brand bg-brand-soft" : "border-line bg-card hover:bg-surface",
                    )}
                  >
                    <span className="block text-sm font-bold text-ink">{item.label}</span>
                    <span className="block text-[11px] text-ink-muted">{item.hint}</span>
                  </button>
                );
              })}
            </div>
            {mode !== "NONE" ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {mode === AnnouncementActionType.INTERNAL ? (
                  <Field label="Screen" hint={screens.isLoading ? "Loading screens…" : "Only screens that exist in the app are listed"}>
                    <Select value={screen} onChange={(e) => setScreen(e.target.value)} disabled={screens.isLoading}>
                      <option value="">Pick a screen</option>
                      {screenOptions.map((s) => (
                        <option key={s.path} value={s.path}>
                          {s.label} — {s.description}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : (
                  <Field label="Link" hint="Opens inside the app, not in Safari or Chrome">
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
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Start showing (optional)" hint="Leave empty to show as soon as it is live">
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </Field>
            <Field label="Stop showing (optional)" hint="Leave empty to keep showing until archived">
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="md:sticky md:top-0 md:self-start">
          <AnnouncementPreview emoji={emoji} title={title} body={body} imageUrl={imageUrl.trim() || null} audience={audience} action={action} />
        </div>
      </div>
    </Drawer>
  );
}
