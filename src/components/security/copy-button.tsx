"use client";

import { Check, Copy, Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, type ButtonProps } from "@/components/kit/primitives";

/** Copies text to the clipboard and says so for a moment. Falls back to a hidden textarea where the API is missing. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the textarea trick
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  ...props
}: { text: string; label?: string; copiedLabel?: string } & Omit<ButtonProps, "onClick" | "children">) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      icon={copied ? Check : Copy}
      onClick={async () => {
        if (await copyText(text)) setCopied(true);
      }}
      aria-live="polite"
      {...props}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

/** Offers a text file to save (the recovery codes). */
export function downloadText(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DownloadButton({
  name,
  text,
  label = "Download",
  ...props
}: { name: string; text: string; label?: string } & Omit<ButtonProps, "onClick" | "children">) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      icon={Download}
      onClick={() => downloadText(name, text)}
      {...props}
    >
      {label}
    </Button>
  );
}
