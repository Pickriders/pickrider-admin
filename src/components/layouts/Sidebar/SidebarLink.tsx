import Link from "next/link";
import { LinkProps } from "./Sidebar.type";
import style from "./styles.module.scss";

export const SidebarLink = ({ path, icon, label }: LinkProps) => {
  return (
    <li>
      <Link href={path} className={style.link}>
        {icon}
        {label}
      </Link>
    </li>
  );
};
