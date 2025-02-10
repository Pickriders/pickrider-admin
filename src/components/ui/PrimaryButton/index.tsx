import { cn } from "@/lib/utils";
import { PrimaryButtonProps, Variant } from "./PrimaryButton.type";
import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";

export const buttonVariant: Record<Variant, string> = {
  default: "bg-primary  text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-[#FF5244] hover:bg-[#ff5144ce] text-white",
  outline: "hover:bg-gray-100 dark:hover:bg-gray-600/30 border text-primary-gray bg-transparent",
};

export const PrimaryButton = ({
  children,
  variant = "default",
  className,
  asChild = false,
  isLoading,
  loadingText,
  ...props
}: PrimaryButtonProps) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "w-full h-[2.4rem] px-4 inline-flex justify-center disabled:cursor-not-allowed disabled:opacity-45  py-2  rounded-lg font-clash-display font-semibold text-sm",
        buttonVariant[variant],
        className,
      )}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-x-1">
          <LoaderCircle size={15} className="animate-spin" /> {loadingText ?? "Loading..."}
        </div>
      ) : (
        children
      )}
    </Comp>
  );
};
