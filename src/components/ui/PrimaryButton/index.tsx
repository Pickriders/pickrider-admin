import { cn } from "@/lib/utils";
import { PrimaryButtonProps, Variant } from "./PrimaryButton.type";
import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";

export const buttonVariant: Record<Variant, string> = {
  default: "bg-primary  text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-[#FF5244] hover:bg-[#ff5144ce] text-white",
  outline: "hover:bg-gray-100 dark:hover:bg-gray-600/30 border text-primary-gray bg-transparent",
};

/**
 * The auth-screen button. While `loading`, the label stays in the flow (invisible) so the button
 * keeps its exact width and height, and the spinner is laid over the centre: nothing jumps when a
 * form submits. Screen readers get `aria-busy` plus `loadingText`.
 */
export const PrimaryButton = ({
  children,
  variant = "default",
  className,
  asChild = false,
  loading,
  isLoading,
  loadingText = "Loading",
  disabled,
  ...props
}: PrimaryButtonProps) => {
  const Comp = asChild ? Slot : "button";
  const busy = Boolean(loading ?? isLoading);
  const classes = cn(
    "relative w-full h-[2.4rem] px-4 inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-45 py-2 rounded-lg font-clash-display font-semibold text-sm",
    buttonVariant[variant],
    className,
  );

  // Slot needs exactly one child, and a link is never "loading": pass it through untouched.
  if (asChild) {
    return (
      <Comp className={classes} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      aria-disabled={disabled || busy || undefined}
      {...props}
    >
      <span
        aria-hidden={busy || undefined}
        className={cn("inline-flex items-center justify-center gap-2", busy && "invisible")}
      >
        {children}
      </span>
      {busy ? (
        <span className="absolute inset-0 flex items-center justify-center" data-testid="button-spinner">
          <LoaderCircle size={18} className="animate-spin" aria-hidden />
          <span className="sr-only" role="status">
            {loadingText}
          </span>
        </span>
      ) : null}
    </button>
  );
};
