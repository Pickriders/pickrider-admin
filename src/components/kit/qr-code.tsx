"use client";

import { useMemo } from "react";

import { cx } from "@/components/kit/primitives";
import { encodeQr, qrPath } from "@/components/kit/qr";

/**
 * A QR code drawn as one SVG path, scaled by CSS. Dark modules use the ink colour and the card
 * stays behind them, so it reads in both themes; authenticator apps scan either way. The four
 * module quiet zone the standard asks for is part of the viewBox.
 */
const QUIET = 4;

export function QrCode({ value, className, label = "QR code" }: { value: string; className?: string; label?: string }) {
  const encoded = useMemo(() => {
    try {
      return encodeQr(value);
    } catch {
      return null;
    }
  }, [value]);
  if (!encoded) {
    return (
      <div
        className={cx(
          "grid aspect-square place-items-center rounded-2xl border border-dashed border-line bg-surface p-4 text-center text-xs text-ink-muted",
          className,
        )}
      >
        This code is too long to draw. Enter the key manually.
      </div>
    );
  }
  const side = encoded.size + QUIET * 2;
  return (
    <svg
      viewBox={`0 0 ${side} ${side}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cx("aspect-square rounded-2xl border border-line bg-white text-black", className)}
      data-qr-version={encoded.version}
      data-qr-mask={encoded.mask}
    >
      <path d={qrPath(encoded)} transform={`translate(${QUIET} ${QUIET})`} fill="currentColor" />
    </svg>
  );
}
