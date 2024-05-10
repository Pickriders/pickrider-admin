"use client";

import Link from "next/link";
import { LinkProps } from "./Sidebar.type";
import style from "./styles.module.scss";
import { SVG } from "@/components/svg";
import { usePathname } from "next/navigation";

export const SidebarLink = ({ path, icon, label }: LinkProps) => {
  const pathname = usePathname();
  const active = pathname === path;
  console.log(path);

  return (
    <li>
      <Link href={path} className={style.link}>
        {active && (
          <span className={style.selectorIcon}>
            <SVG.SelectorIcon />
          </span>
        )}

        <span className={style.linkIcon}>{icon}</span>
        {label}
      </Link>
    </li>
  );
};
