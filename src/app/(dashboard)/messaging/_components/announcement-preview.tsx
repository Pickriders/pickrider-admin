"use client";

import { ArrowUpRight, ImageOff, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { cx } from "@/components/kit";
import { AnnouncementActionType, AnnouncementAudience } from "@/lib/admin/api";

/**
 * A phone-shaped mock of the popup the apps render, so staff see roughly what a person will
 * see before it goes out. The real popup lives in the apps; this mirrors its layout, not its
 * exact styling.
 */
export function AnnouncementPreview({
  emoji,
  title,
  body,
  imageUrl,
  audience,
  action,
}: {
  emoji?: string | null;
  title: string;
  body: string;
  imageUrl?: string | null;
  audience: AnnouncementAudience;
  action?: { type: AnnouncementActionType; label: string; target: string } | null;
}) {
  const isRiders = audience === AnnouncementAudience.RIDERS;
  // The apps render images with React Native's <Image>: a direct JPG/PNG/WebP URL works, a web
  // page or an SVG does not. Surface a failure here so it is fixed before it goes out.
  const [imageState, setImageState] = useState<"loading" | "ok" | "failed">("loading");
  useEffect(() => setImageState("loading"), [imageUrl]);
  const isSvg = /\.svg(\?|$)/i.test(imageUrl ?? "");
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <Smartphone size={13} /> {isRiders ? "Rider app" : "Customer app"} preview
      </p>
      <div className="mx-auto w-full max-w-[17rem] rounded-[2rem] border-4 border-ink/80 bg-ink/90 p-2 shadow-xl">
        <div className="relative h-[26rem] overflow-hidden rounded-[1.5rem] bg-surface">
          <div className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-card p-4 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            {imageUrl && imageState !== "failed" && !isSvg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="mb-3 max-h-40 w-full rounded-xl object-contain"
                onLoad={() => setImageState("ok")}
                onError={() => setImageState("failed")}
              />
            ) : imageUrl ? (
              <div className="mb-3 flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-danger/50 bg-danger/5 px-3 text-center">
                <ImageOff size={18} className="text-danger" />
                <p className="text-[10px] font-semibold leading-tight text-danger">
                  {isSvg ? "SVG images do not show in the apps. Use a JPG, PNG or WebP." : "This link is not an image the apps can load. Use a direct JPG, PNG or WebP URL."}
                </p>
              </div>
            ) : (
              <div className="mb-3 text-center text-5xl leading-none">{emoji?.trim() || "🎉"}</div>
            )}
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-brand">New on Pickriders</p>
            <p className="mt-1 text-center text-base font-black leading-tight text-ink">{title.trim() || "Your headline"}</p>
            <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-center text-xs leading-relaxed text-ink-muted">
              {body.trim() || "A couple of lines on what is new and why it matters."}
            </p>
            <div className="mt-4 space-y-2">
              <div
                className={cx(
                  "flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-bold",
                  "bg-brand text-brand-ink",
                )}
              >
                {action?.label?.trim() || "Got it"}
                {action?.type === AnnouncementActionType.EXTERNAL ? <ArrowUpRight size={14} /> : null}
              </div>
              <div className="flex h-9 items-center justify-center rounded-xl text-xs font-semibold text-ink-muted">
                Show me later
              </div>
              {action ? <p className="text-center text-[10px] text-ink-faint underline">Don&apos;t show this again</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
