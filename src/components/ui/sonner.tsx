"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Admin toasts: a clean card (light + dark) with a soft depth shadow, the Urbanist
// body font, and the semantic colour carried entirely by the icon — which sits in
// a subtle tinted circle (brand teal for success, red/amber/sky otherwise). No
// border accent; the icon is the signal.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      offset={16}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans gap-3 rounded-2xl border border-border/60 p-4 group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:shadow-[0_12px_40px_-12px_rgba(16,24,40,0.28)]",
          title: "text-[13px] font-semibold leading-snug",
          description: "group-[.toast]:text-muted-foreground text-xs leading-relaxed mt-0.5",
          icon: "flex size-9 shrink-0 items-center justify-center rounded-full [&>svg]:size-[18px]",
          actionButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:font-semibold group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:border-border/60 group-[.toast]:bg-card group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground",
          success: "[&_[data-icon]]:bg-primary/10 [&_[data-icon]]:text-primary",
          error: "[&_[data-icon]]:bg-red-500/10 [&_[data-icon]]:text-red-500",
          warning: "[&_[data-icon]]:bg-amber-500/10 [&_[data-icon]]:text-amber-500",
          info: "[&_[data-icon]]:bg-sky-500/10 [&_[data-icon]]:text-sky-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
