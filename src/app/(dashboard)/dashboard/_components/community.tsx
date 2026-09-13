"use client";

import Link from "next/link";
import { ArrowRight, Bike, Building2, Car, Users, type LucideIcon } from "lucide-react";

import type { Overview } from "@/lib/admin/api";
import { count } from "@/lib/admin/format";
import { Panel, PanelHeader, Skeleton, cx } from "@/components/kit/primitives";

/**
 * Everyone on the platform, one row per group: the headline count, a
 * composition bar showing how the group splits, and the two or three numbers
 * that matter for it. Lifetime counts; "new" is the selected window.
 */
type Segment = { label: string; value: number; className: string };
type Row = { key: string; icon: LucideIcon; title: string; total: number; href: string; segments: Segment[]; facts: { label: string; value: number; href?: string; tone?: "up" | "down" }[] };

export function Community({ users, vehicles, loading, windowLabel }: { users?: Overview["users"]; vehicles?: Overview["vehicles"]; loading: boolean; windowLabel: string }) {
  const u = users ?? {};
  const v = vehicles ?? {};
  const rows: Row[] = [
    {
      key: "customers",
      icon: Users,
      title: "Customers",
      total: u.customers ?? 0,
      href: "/customers",
      segments: [
        { label: "Active", value: u.customersActive ?? 0, className: "bg-brand" },
        { label: "Inactive", value: Math.max(0, (u.customers ?? 0) - (u.customersActive ?? 0)), className: "bg-line-strong" },
      ],
      facts: [
        { label: `New, ${windowLabel}`, value: u.customersNew ?? 0, href: "/customers?sortBy=joined&order=DESC", tone: "up" },
        { label: "Active", value: u.customersActive ?? 0, href: "/customers?status=ACTIVE" },
      ],
    },
    {
      key: "riders",
      icon: Bike,
      title: "Riders",
      total: u.riders ?? 0,
      href: "/couriers",
      segments: [
        { label: "Licence approved", value: u.ridersLicenceApproved ?? 0, className: "bg-success" },
        { label: "Licence awaiting", value: u.ridersLicenceAwaiting ?? 0, className: "bg-warning" },
        { label: "Other", value: Math.max(0, (u.riders ?? 0) - (u.ridersLicenceApproved ?? 0) - (u.ridersLicenceAwaiting ?? 0)), className: "bg-line-strong" },
      ],
      facts: [
        { label: "Online now", value: u.ridersOnline ?? 0, href: "/couriers?isOnline=true", tone: "up" },
        { label: `New, ${windowLabel}`, value: u.ridersNew ?? 0, href: "/couriers?sortBy=createdAt&order=DESC" },
        { label: "Paused", value: u.ridersPaused ?? 0, href: "/couriers?dispatchPaused=true", tone: "down" },
        { label: "Suspended", value: u.suspended ?? 0, href: "/couriers?status=SUSPENDED", tone: "down" },
      ],
    },
    {
      key: "businesses",
      icon: Building2,
      title: "Businesses",
      total: u.businesses ?? 0,
      href: "/business",
      segments: [{ label: "Businesses", value: u.businesses ?? 0, className: "bg-chart-2" }],
      facts: [
        { label: "Owners", value: u.businessOwners ?? 0 },
        { label: "Platform staff", value: u.staff ?? 0, href: "/admin?tab=team" },
      ],
    },
    {
      key: "fleet",
      icon: Car,
      title: "Fleet",
      total: v.total ?? 0,
      href: "/vehicles",
      segments: [
        { label: "Verified", value: v.verified ?? 0, className: "bg-success" },
        { label: "Pending", value: v.pending ?? 0, className: "bg-warning" },
        { label: "Rejected or suspended", value: (v.rejected ?? 0) + (v.suspended ?? 0), className: "bg-danger" },
      ],
      facts: [
        { label: "Verified", value: v.verified ?? 0, href: "/vehicles?status=VERIFIED", tone: "up" },
        { label: "Pending", value: v.pending ?? 0, href: "/vehicles?status=PENDING", tone: "down" },
      ],
    },
  ];

  return (
    <Panel className="h-full">
      <PanelHeader title="People and fleet" subtitle="Everyone on the platform" />
      <ul className="divide-y divide-line px-6 pb-2 pt-2">
        {rows.map((row) => {
          const Icon = row.icon;
          const segTotal = row.segments.reduce((s, seg) => s + seg.value, 0) || 1;
          return (
            <li key={row.key} className="py-4 first:pt-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-ink-muted">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={row.href} className="group inline-flex items-center gap-1 text-sm font-bold text-ink hover:text-brand-dark">
                    {row.title}
                    <ArrowRight size={13} className="text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <p className="text-[11px] text-ink-faint">{row.segments.map((s) => `${count(s.value)} ${s.label.toLowerCase()}`).join(" · ")}</p>
                </div>
                <span className="text-2xl font-black leading-none tracking-tight tabular-nums text-ink">{loading ? <Skeleton className="h-6 w-12" /> : count(row.total)}</span>
              </div>
              <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-surface">
                {row.segments.map((seg) =>
                  seg.value ? <span key={seg.label} title={`${seg.label}: ${count(seg.value)}`} className={cx("h-full", seg.className)} style={{ width: `${(seg.value / segTotal) * 100}%` }} /> : null,
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {row.facts.map((fact) => {
                  const body = (
                    <>
                      <span className={cx("text-sm font-black tabular-nums", fact.tone === "up" ? "text-success" : fact.tone === "down" ? "text-danger" : "text-ink")}>{loading ? "…" : count(fact.value)}</span>
                      <span className="text-xs text-ink-muted">{fact.label}</span>
                    </>
                  );
                  return fact.href ? (
                    <Link key={fact.label} href={fact.href} className="inline-flex items-baseline gap-1.5 hover:underline">
                      {body}
                    </Link>
                  ) : (
                    <span key={fact.label} className="inline-flex items-baseline gap-1.5">
                      {body}
                    </span>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
