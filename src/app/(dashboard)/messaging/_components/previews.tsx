"use client";

import { Bell } from "lucide-react";

import { time } from "@/lib/admin/format";

/**
 * What the recipient sees: a phone lock-screen card for push and a mail
 * client card for email. Pure presentation, driven by the compose draft.
 */
export function PushPreview({ subject, message }: { subject: string; message: string }) {
  return (
    <div className="mx-auto w-full max-w-[16rem]">
      <div className="rounded-[2rem] border-4 border-ink bg-ink p-2 shadow-pop">
        <div className="rounded-[1.5rem] bg-gradient-to-b from-brand to-brand-dark px-3 pb-10 pt-8">
          <p className="text-center text-3xl font-black tracking-tight text-white">{time(new Date())}</p>
          <p className="mt-0.5 text-center text-[11px] font-medium text-white/70">Today</p>
          <div className="mt-6 rounded-2xl bg-card/95 p-3 shadow-card">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-brand text-white">
                <Bell size={11} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Pickriders</span>
              <span className="ml-auto text-[10px] text-ink-faint">now</span>
            </div>
            <p className="mt-1.5 line-clamp-1 text-xs font-bold text-ink">{subject || "Subject line"}</p>
            <p className="line-clamp-3 text-[11px] leading-snug text-ink-muted">{message || "Your message shows here."}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-faint">Push preview</p>
    </div>
  );
}

export function EmailPreview({ subject, message }: { subject: string; message: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
        <div className="border-b border-line bg-surface px-4 py-3">
          <p className="line-clamp-1 text-sm font-bold text-ink">{subject || "Subject line"}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            From <span className="font-semibold text-ink">Pickriders</span> · to the recipient
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="mb-3 h-6 w-24 rounded-md bg-brand" />
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{message || "Your message shows here."}</p>
          <p className="mt-5 text-[11px] text-ink-faint">You are receiving this because you have a Pickriders account.</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-faint">Email preview</p>
    </div>
  );
}
