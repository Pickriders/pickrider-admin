"use client";

import { Badge, type Tone } from "@/components/kit";
import type { AchievementCategory } from "@/lib/admin/api";

export const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  SINGLE: "Single deliveries",
  BATCH: "Batch deliveries",
  BULK: "Bulk / errands",
  WALLET: "Wallet",
  REFERRAL: "Referrals",
  SPECIAL: "Special",
};
export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as AchievementCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

export const REWARD_STATE_LABEL: Record<string, string> = {
  REDEEMED: "Redeemed",
  ACTIVE: "Unused",
  EXPIRED: "Expired",
  NONE: "No reward",
};
export const REWARD_STATE_TONE: Record<string, Tone> = {
  REDEEMED: "success",
  ACTIVE: "brand",
  EXPIRED: "neutral",
  NONE: "neutral",
};

/** Icon chip colour per tier, so a badge's weight reads before its name. */
export const TIER_CHIP: Record<number, string> = {
  3: "bg-brand-soft text-brand-dark",
  2: "bg-info-soft text-info",
  1: "bg-surface text-ink-muted",
};

export function TierBadge({ tier, percent, compact }: { tier: number; percent: number; compact?: boolean }) {
  const tone: Tone = tier === 3 ? "brand" : tier === 2 ? "info" : "neutral";
  return <Badge tone={tone}>{compact ? `Tier ${tier}` : `Tier ${tier} · ${percent}% off`}</Badge>;
}

export function RewardStateBadge({ state }: { state?: string }) {
  if (!state) return null;
  return (
    <Badge tone={REWARD_STATE_TONE[state] ?? "neutral"} dot>
      {REWARD_STATE_LABEL[state] ?? state}
    </Badge>
  );
}

export function ProgressBar({ value, target }: { value: number; target: number }) {
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-line">
      <span className="block h-full rounded-full bg-brand" style={{ width: `${ratio * 100}%` }} />
    </span>
  );
}
