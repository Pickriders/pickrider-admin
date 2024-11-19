import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../BreadCrumb";
import { SVG } from "@/components/svg";

interface BreadCrumbNavProps {
  linkPage: string;
  currentPage: string;
  rootPageLink: string;
}

export const BreadCrumbNav = ({
  currentPage,
  linkPage,
  rootPageLink,
}: BreadCrumbNavProps) => {
  return (
    <div className="flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={rootPageLink}>{linkPage}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Link
        href={rootPageLink}
        className="font-semibold flex items-center gap-x-2 text-sm text-foreground font-clash-display"
      >
        <SVG.XIcon width={18} />
        Close
      </Link>
    </div>
  );
};
