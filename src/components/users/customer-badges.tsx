"use client";

import { Award, Gift, Minus, Plus } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Panel,
  Select,
  Skeleton,
  Textarea,
  cx,
} from "@/components/kit";
import { achievements, type CustomerAchievement } from "@/lib/admin/api";
import { count, day, naira, when } from "@/lib/admin/format";
import { useAction, useCustomerAchievements } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { canManageAchievements, getAdminRoles } from "@/lib/admin-access";

/**
 * A customer's badge wall as the app shows it, plus the two support actions: grant a badge the
 * rules missed (issues its reward coupon) and revoke one (deactivates an unused reward). Reading
 * this never unlocks anything — the admin endpoint is read-only.
 */
const CATEGORY_LABEL: Record<string, string> = {
  SINGLE: "Single deliveries",
  BATCH: "Batch deliveries",
  BULK: "Bulk / errands",
  WALLET: "Wallet",
  REFERRAL: "Referrals",
  SPECIAL: "Special",
};
const STATS_LABEL: Record<string, string> = {
  completed: "Completed orders",
  single: "Single",
  batch: "Batch",
  bulk: "Bulk",
  earlyBird: "Before 8am",
  distanceKm: "Distance (km)",
  fundingCount: "Wallet top-ups",
  fundingTotal: "Total funded",
  referralsEarned: "Referrals earned",
  fiveStarReviews: "5★ reviews given",
  streakWeeks: "Weekly streak",
};

export function CustomerBadges({ userId, enabled = true }: { userId: string; enabled?: boolean }) {
  const { data, isPending, error, refetch } = useCustomerAchievements(userId, enabled);
  const canManage = canManageAchievements(getAdminRoles());
  const invalidate = [["achievements", "user", userId], ["achievements"], "coupons"];

  const [granting, setGranting] = useState(false);
  const [grantKey, setGrantKey] = useState("");
  const [reason, setReason] = useState("");
  const grant = useAction((vars: { key: string; reason?: string }) => achievements.grant(userId, vars), {
    success: "Badge granted and its reward coupon issued.",
    invalidate,
    onSuccess: () => {
      setGranting(false);
      setGrantKey("");
      setReason("");
    },
  });

  const [revoking, setRevoking] = useState<CustomerAchievement | null>(null);
  const revoke = useAction((key: string) => achievements.revoke(userId, key), {
    success: "Badge revoked. Its unused reward coupon has been deactivated.",
    invalidate,
    onSuccess: () => setRevoking(null),
  });

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (error || !data)
    return (
      <ErrorState message={error ? errorMessage(error) : "Could not load badges"} onRetry={() => void refetch()} />
    );

  const grantable = data.results.filter((row) => row.status !== "COMPLETED");
  const groups = Object.entries(
    data.results.reduce<Record<string, CustomerAchievement[]>>((acc, row) => {
      (acc[row.category] ??= []).push(row);
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink-muted">
          <span className="font-bold text-ink">{count(data.unlockedCount)}</span> of {count(data.results.length)} badges
          unlocked
        </p>
        {canManage && grantable.length ? (
          <Button variant="outline" icon={Plus} onClick={() => setGranting(true)}>
            Grant a badge
          </Button>
        ) : null}
      </div>

      <Panel className="p-5">
        <p className="mb-3 text-xs font-semibold text-ink-muted">What the badges are judged on</p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
          {Object.entries(STATS_LABEL).map(([key, label]) => (
            <div key={key} className="min-w-0">
              <dt className="truncate text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
              <dd className="text-sm font-bold text-ink">
                {key === "fundingTotal"
                  ? naira(data.stats[key])
                  : key === "distanceKm"
                    ? (data.stats[key] ?? 0).toFixed(1)
                    : count(data.stats[key])}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {groups.length ? (
        groups.map(([category, rows]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">
              {CATEGORY_LABEL[category] ?? category}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((row) => (
                <BadgeTile
                  key={row.key}
                  row={row}
                  onRevoke={canManage && row.status === "COMPLETED" ? () => setRevoking(row) : undefined}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyState icon={Award} title="No badges in the catalogue" />
      )}

      <ConfirmDialog
        open={granting}
        onClose={() => setGranting(false)}
        onConfirm={() => grantKey && grant.mutate({ key: grantKey, reason: reason.trim() || undefined })}
        title="Grant a badge"
        description="Unlocks it immediately and issues the reward coupon to this customer. Use it when they clearly earned a badge the rules missed."
        confirmLabel="Grant badge"
        loading={grant.isPending}
      >
        <div className="space-y-3">
          <Field label="Badge">
            <Select value={grantKey} onChange={(event) => setGrantKey(event.target.value)}>
              <option value="">Choose…</option>
              {grantable.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.title} — {row.reward.percent}% reward ({row.progress}/{row.target} {row.unit})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Reason (audit trail)">
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Completed 5 orders; one was cancelled by mistake and later delivered."
            />
          </Field>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(revoking)}
        onClose={() => setRevoking(null)}
        onConfirm={() => revoking && revoke.mutate(revoking.key)}
        title={`Revoke ${revoking?.title}?`}
        description={
          revoking?.reward.couponCode
            ? `The badge disappears from their app. Reward coupon ${revoking.reward.couponCode} is deactivated if it has not been used; a redeemed reward is not clawed back.`
            : "The badge disappears from their app."
        }
        confirmLabel="Revoke badge"
        tone="danger"
        loading={revoke.isPending}
      />
    </div>
  );
}

function BadgeTile({ row, onRevoke }: { row: CustomerAchievement; onRevoke?: () => void }) {
  const done = row.status === "COMPLETED";
  const ratio = row.target > 0 ? Math.min(1, row.progress / row.target) : 0;
  return (
    <Panel className={cx("p-4", done ? "border-brand/40" : "")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <Award size={14} className={done ? "text-brand-dark" : "text-ink-faint"} />
            <span className="truncate">{row.title}</span>
            {row.isNew ? <Badge tone="warning">Not seen yet</Badge> : null}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{row.description}</p>
        </div>
        {onRevoke ? (
          <button
            type="button"
            aria-label="Revoke badge"
            onClick={onRevoke}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-faint hover:bg-danger-soft hover:text-danger"
          >
            <Minus size={14} />
          </button>
        ) : null}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-[11px]">
          <span className="font-semibold text-ink">
            {count(row.progress)} / {count(row.target)} {row.unit}
          </span>
          <span className="text-ink-faint">
            {done && row.unlockedAt
              ? `Unlocked ${day(row.unlockedAt)}`
              : row.status === "IN_PROGRESS"
                ? "In progress"
                : "Not started"}
          </span>
        </div>
        <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-line">
          <span
            className={cx("block h-full rounded-full", done ? "bg-brand" : "bg-ink-faint/50")}
            style={{ width: `${ratio * 100}%` }}
          />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
        <Gift size={12} />
        <span>
          {row.reward.percent}% off, max {naira(row.reward.maxDiscount)}
        </span>
        {row.reward.couponCode ? (
          <span className="font-mono text-ink">
            {row.reward.couponCode}
            {row.reward.expiresAt ? ` · until ${when(row.reward.expiresAt)}` : ""}
          </span>
        ) : null}
      </div>
    </Panel>
  );
}
