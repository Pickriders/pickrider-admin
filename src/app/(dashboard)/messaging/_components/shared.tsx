"use client";

import { Badge, type Tone } from "@/components/kit";
import type { Broadcast } from "@/lib/admin/api";

/** Labels and colours the three messaging tabs share. */
export type Audience = Broadcast["audience"];
export type Channel = "PUSH" | "EMAIL";

export const AUDIENCES: { id: Audience; label: string; hint: string }[] = [
  { id: "CUSTOMERS", label: "Customers", hint: "People who order deliveries" },
  { id: "RIDERS", label: "Couriers", hint: "Riders on the platform" },
  { id: "BUSINESSES", label: "Businesses", hint: "Business admin accounts" },
  { id: "USERS", label: "Specific people", hint: "Hand-picked accounts" },
];

export const AUDIENCE_LABEL: Record<string, string> = Object.fromEntries(AUDIENCES.map((a) => [a.id, a.label]));

export const CHANNEL_TONE: Record<string, Tone> = { PUSH: "brand", EMAIL: "info", IN_APP: "neutral", SMS: "warning" };
export const CHANNEL_LABEL: Record<string, string> = { PUSH: "Push", EMAIL: "Email", IN_APP: "In-app", SMS: "SMS" };

export const BROADCAST_TONE: Record<string, Tone> = { QUEUED: "warning", SENDING: "info", SENT: "success", FAILED: "danger" };
export const BROADCAST_LABEL: Record<string, string> = { QUEUED: "Queued", SENDING: "Sending", SENT: "Sent", FAILED: "Failed" };

export function ChannelBadges({ channels }: { channels: string[] | undefined }) {
  return (
    <span className="flex flex-wrap gap-1">
      {(channels ?? []).map((channel) => (
        <Badge key={channel} tone={CHANNEL_TONE[channel] ?? "neutral"}>
          {CHANNEL_LABEL[channel] ?? channel}
        </Badge>
      ))}
    </span>
  );
}

export function BroadcastStatusBadge({ status }: { status: string | undefined }) {
  const key = status ?? "QUEUED";
  return (
    <Badge tone={BROADCAST_TONE[key] ?? "neutral"} dot>
      {BROADCAST_LABEL[key] ?? key}
    </Badge>
  );
}

/** Short, copy-safe rendering of a Mongo id for people-less rows. */
export function shortId(id: string | undefined | null) {
  if (!id) return "";
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}
