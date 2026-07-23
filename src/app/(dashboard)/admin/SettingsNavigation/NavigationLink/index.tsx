import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface NavigationLinksProps {
  title: string;
  description?: string;
  href: string;
  headIcon: ReactNode;
}

export const NavigationLinks = ({ headIcon, href, title, description }: NavigationLinksProps) => {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">{headIcon}</span>
        <span className="grid size-7 place-items-center rounded-full border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
          <ChevronRight size={14} />
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </Link>
  );
};
