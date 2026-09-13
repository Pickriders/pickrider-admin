"use client";

import Link from "next/link";
import { Camera, KeyRound, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { me } from "@/lib/admin/api";
import { useAction, useMe } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { day, fullName, when } from "@/lib/admin/format";
import { FONTS, type FontId } from "@/lib/admin/fonts";
import { useAdminPrefs } from "@/components/kit/prefs";
import { Avatar, Badge, Button, ErrorState, Field, KeyValue, LinkButton, PageHeader, Panel, PanelHeader, Select, Skeleton, cx } from "@/components/kit/primitives";

/**
 * The signed-in admin: who they are, what they can do, and how the admin
 * looks for them. Details are read only; the photo and preferences save here.
 */
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const MODES: { id: "light" | "dark" | "system"; label: string; hint: string; icon: LucideIcon }[] = [
  { id: "light", label: "Light", hint: "Always light", icon: Sun },
  { id: "dark", label: "Dark", hint: "Always dark", icon: Moon },
  { id: "system", label: "System", hint: "Follows your device", icon: Monitor },
];

function roleLabel(role: string) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
  const profile = useMe();
  const user = profile.data;
  const name = fullName(user);

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumb={
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
        }
        title="Profile"
        description="Your account, your roles, and how the admin looks for you."
        actions={
          <LinkButton href="/dashboard/change-password" icon={KeyRound}>
            Change password
          </LinkButton>
        }
      />

      {profile.error && !user ? (
        <ErrorState message={errorMessage(profile.error, "Could not load your profile.")} onRetry={() => void profile.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel className="xl:col-span-1">
            <PanelHeader title="Account" subtitle="Details come from your admin record" />
            <div className="p-5 pt-4">
              <PhotoBlock name={name} photo={user?.photo} loading={profile.isLoading && !user} />
              <div className="mt-5">
                {profile.isLoading && !user ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : (
                  <KeyValue
                    columns={1}
                    items={[
                      { label: "Name", value: name || undefined },
                      { label: "Email", value: user?.email },
                      { label: "Phone", value: user?.phone },
                      { label: "Status", value: user?.status ? <Badge tone={user.status === "ACTIVE" ? "success" : "danger"}>{roleLabel(user.status)}</Badge> : undefined },
                      { label: "Last sign in", value: user?.lastLoginDate ? when(user.lastLoginDate) : undefined },
                      { label: "Member since", value: user?.createdAt ? day(user.createdAt) : undefined },
                    ]}
                  />
                )}
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Roles</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.isLoading && !user ? (
                    <Skeleton className="h-5 w-32" />
                  ) : user?.roles?.length ? (
                    user.roles.map((role) => (
                      <Badge key={role} tone="brand">
                        {roleLabel(role)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-ink-faint">No roles assigned</span>
                  )}
                </div>
              </div>
              <p className="mt-5 text-[11px] text-ink-faint">Name, email and phone are managed by a platform owner from the team page.</p>
            </div>
          </Panel>

          <Panel className="xl:col-span-2">
            <PanelHeader title="Appearance" subtitle="Saved to your profile, so it follows you to any device" />
            <div className="p-5 pt-4">
              <AppearanceBlock />
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function PhotoBlock({ name, photo, loading }: { name: string; photo?: string; loading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const upload = useAction((body: { photo: string }) => me.updatePhoto(body), {
    success: "Profile photo updated.",
    invalidate: ["me"],
    onSuccess: () => setPreview(null),
  });

  const onPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Keep the photo under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === "string" ? reader.result : null;
      if (!data) return;
      setPreview(data);
      upload.mutate({ photo: data });
    };
    reader.onerror = () => toast.error("Could not read that file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        {loading ? <Skeleton className="h-20 w-20 rounded-full" /> : <Avatar src={preview ?? photo} name={name} size={80} />}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending || loading}
          aria-label="Change photo"
          className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-brand text-brand-ink shadow-sm transition-transform hover:scale-105 disabled:opacity-60"
        >
          <Camera size={14} />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-black tracking-tight text-ink">{loading ? <Skeleton className="h-6 w-32" /> : name || "Admin"}</p>
        <Button variant="outline" size="sm" icon={Camera} loading={upload.isPending} onClick={() => inputRef.current?.click()} disabled={loading} className="mt-2">
          {photo ? "Change photo" : "Upload photo"}
        </Button>
        <p className="mt-1.5 text-[11px] text-ink-faint">JPG or PNG, up to 2 MB.</p>
      </div>
    </div>
  );
}

function AppearanceBlock() {
  const prefs = useAdminPrefs();
  const mode = (prefs.theme === "light" || prefs.theme === "dark" ? prefs.theme : "system") as "light" | "dark" | "system";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-ink-muted">Theme</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODES.map((option) => {
            const Icon = option.icon;
            const active = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => prefs.setThemeMode(option.id)}
                aria-pressed={active}
                className={cx(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  active ? "border-brand bg-brand-soft" : "border-line hover:bg-surface",
                )}
              >
                <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-lg", active ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted")}>
                  <Icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className={cx("block text-sm font-bold", active ? "text-brand-dark" : "text-ink")}>{option.label}</span>
                  <span className="block text-[11px] text-ink-faint">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-ink-faint">Currently showing {prefs.resolvedTheme === "dark" ? "dark" : "light"}.</p>
      </div>

      <Field label="Font" hint="Applies to the whole admin as soon as you pick one." className="max-w-sm">
        <Select value={prefs.fontId} onChange={(e) => prefs.setFont(e.target.value as FontId)}>
          {FONTS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Preview</p>
        <p className="mt-1 text-xl font-black tracking-tight text-ink">The quick brown rider jumps over the lazy order.</p>
        <p className="mt-0.5 text-sm text-ink-muted">Headings, body text and numbers like 1,234,567 all use this font.</p>
      </div>
    </div>
  );
}
