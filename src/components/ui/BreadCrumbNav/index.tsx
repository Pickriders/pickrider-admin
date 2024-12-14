"use client";

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
import React from "react";

interface BreadCrumbNavProps {
  currentPage: string;
  rootPageLink: string;
  pageLinks: Array<{ href: string; label: string }>;
}

export const BreadCrumbNav = ({
  currentPage,
  rootPageLink,
  pageLinks,
}: BreadCrumbNavProps) => {
  return (
    <div className="flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {pageLinks.map((link, i) => (
            <React.Fragment key={i}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={link.href}>{link.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}

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
