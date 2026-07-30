"use client";

import { UI } from "@/components/ui";
import { useGetBusinessQuery } from "@/api/queries/business";

export const BusinessCrumb = ({ businessId }: { businessId: string }) => {
  const { data: business } = useGetBusinessQuery(businessId);
  return (
    <UI.BreadCrumbNav
      currentPage={business?.name ?? "Business details"}
      pageLinks={[{ href: "/business", label: "Business" }]}
      rootPageLink="/business"
    />
  );
};
