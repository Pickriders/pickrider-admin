"use client";

import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, Badge, Button, ErrorState, KeyValue, Panel, PanelHeader, Skeleton } from "@/components/kit";
import { me } from "@/lib/admin/api";
import { day, fullName, when } from "@/lib/admin/format";
import { useAction, useMe } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { formatEmail } from "@/lib/admin/person";

/**
 * Settings, Profile tab: who the signed-in admin is. Name, email and phone are read only
 * (a platform owner changes them from the team page); the photo saves here.
 */
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function roleLabel(role: string) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProfileTab() {
  const profile = useMe();
  const user = profile.data;
  const name = fullName(user);
  const loading = profile.isLoading && !user;

  if (profile.error && !user) {
    return <ErrorState message={errorMessage(profile.error, "Could not load your profile.")} onRetry={() => void profile.refetch()} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Panel className="lg:col-span-3">
        <PanelHeader title="Your details" subtitle="From your admin record" />
        <div className="space-y-6 p-5 pt-4">
          <PhotoBlock name={name} photo={user?.photo} loading={loading} />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <KeyValue
              columns={2}
              items={[
                { label: "Name", value: name || undefined },
                { label: "Email", value: formatEmail(user?.email) || undefined },
                { label: "Phone", value: user?.phone },
                {
                  label: "Status",
                  value: user?.status ? <Badge tone={user.status === "ACTIVE" ? "success" : "danger"}>{roleLabel(user.status)}</Badge> : undefined,
                },
              ]}
            />
          )}
          <p className="rounded-xl bg-surface px-3 py-2 text-xs text-ink-muted">
            Name, email and phone are managed by a platform owner from the team page. Ask one if any of them is wrong.
          </p>
        </div>
      </Panel>

      <Panel className="lg:col-span-2">
        <PanelHeader title="Access" subtitle="What this account can do" />
        <div className="space-y-5 p-5 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Roles</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {loading ? (
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
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <KeyValue
              columns={1}
              items={[
                { label: "Last sign in", value: user?.lastLoginDate ? when(user.lastLoginDate) : undefined },
                { label: "Member since", value: user?.createdAt ? day(user.createdAt) : undefined },
              ]}
            />
          )}
        </div>
      </Panel>
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
        <div className="truncate text-lg font-black tracking-tight text-ink">{loading ? <Skeleton className="h-6 w-32" /> : name || "Admin"}</div>
        <Button variant="outline" size="sm" icon={Camera} loading={upload.isPending} onClick={() => inputRef.current?.click()} disabled={loading} className="mt-2">
          {photo ? "Change photo" : "Upload photo"}
        </Button>
        <p className="mt-1.5 text-[11px] text-ink-faint">JPG or PNG, up to 2 MB.</p>
      </div>
    </div>
  );
}
