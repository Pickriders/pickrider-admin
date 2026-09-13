"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";

import type { BusinessDetail as BusinessDetailShape } from "@/lib/admin/api";
import { errorMessage } from "@/lib/admin/http";
import { useBusiness } from "@/lib/admin/hooks";
import { useTabParam } from "@/lib/admin/url-state";
import { Avatar, Badge, ErrorState, PageHeader, Skeleton, Tabs } from "@/components/kit";

import { CouriersTab } from "./tabs/CouriersTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { TransactionsTab } from "./tabs/TransactionsTab";
import { VehiclesTab } from "./tabs/VehiclesTab";

/**
 * One page for a business. The tab lives in the URL (?tab=) so the old
 * /business/:id/couriers, /orders, /vehicles and /edit routes redirect here
 * with the tab preset and deep links keep working.
 */
export const BUSINESS_TABS = ["overview", "couriers", "orders", "vehicles", "transactions", "settings"] as const;
export type BusinessTab = (typeof BUSINESS_TABS)[number];

const TAB_LABEL: Record<BusinessTab, string> = {
  overview: "Overview",
  couriers: "Couriers",
  orders: "Orders",
  vehicles: "Vehicles",
  transactions: "Transactions",
  settings: "Settings",
};

export const BUSINESS_TYPE_LABEL: Record<string, string> = {
  BANKING: "Banking",
  CLIENT: "Client",
  PARTNER: "Partner",
  SUPPLIER: "Supplier",
  MERCHANT: "Merchant",
  AGENCY_BANKING: "Agency banking",
  PICKRIDERS_AGENT: "Pickriders agent",
};

export const SERVICE_TYPE_LABEL: Record<string, string> = {
  AUTO_PILOT: "Auto pilot",
  ON_REQUEST: "On request",
};

export function businessLogo(business: BusinessDetailShape | undefined) {
  return business?.photo ?? business?.logo ?? null;
}

function BusinessDetailInner({ businessId }: { businessId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab] = useTabParam<BusinessTab>("overview", BUSINESS_TABS);
  const query = useBusiness(businessId);
  const business = query.data as BusinessDetailShape | undefined;

  // Each tab has its own filters, so a tab change starts from a clean URL
  // rather than carrying a vehicle status filter into the couriers table.
  const setTab = useCallback(
    (next: BusinessTab) => {
      router.replace(next === "overview" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
    },
    [pathname, router],
  );

  if (query.error) {
    return (
      <div>
        <PageHeader title="Business" breadcrumb={<Link href="/business">Business</Link>} />
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link href="/business" className="hover:text-ink">
              Business
            </Link>
            <span>/</span>
            <span>{TAB_LABEL[tab]}</span>
          </span>
        }
        title={
          business ? (
            <span className="flex flex-wrap items-center gap-3">
              <Avatar src={businessLogo(business)} name={business.name} size={40} />
              <span>{business.name}</span>
              {business.isActive === false ? (
                <Badge tone="danger" dot>
                  Inactive
                </Badge>
              ) : (
                <Badge tone="success" dot>
                  Active
                </Badge>
              )}
              {business.type ? <Badge>{BUSINESS_TYPE_LABEL[business.type] ?? business.type}</Badge> : null}
            </span>
          ) : (
            <Skeleton className="h-9 w-64" />
          )
        }
        description={
          business
            ? [business.businessHandle ? `@${business.businessHandle}` : null, business.email, business.phone].filter(Boolean).join(" · ")
            : undefined
        }
      />

      <Tabs<BusinessTab>
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={BUSINESS_TABS.map((id) => ({
          id,
          label: TAB_LABEL[id],
          count: id === "couriers" ? business?.users?.length : id === "vehicles" ? business?.vehicles?.length : undefined,
        }))}
      />

      {tab === "overview" ? <OverviewTab businessId={businessId} business={business} loading={query.isPending} onTab={setTab} /> : null}
      {tab === "couriers" ? <CouriersTab businessId={businessId} /> : null}
      {tab === "orders" ? <OrdersTab businessId={businessId} /> : null}
      {tab === "vehicles" ? <VehiclesTab businessId={businessId} /> : null}
      {tab === "transactions" ? <TransactionsTab businessId={businessId} /> : null}
      {tab === "settings" ? <SettingsTab businessId={businessId} business={business} loading={query.isPending} /> : null}
    </div>
  );
}

export function BusinessDetail({ businessId }: { businessId: string }) {
  return (
    <Suspense>
      <BusinessDetailInner businessId={businessId} />
    </Suspense>
  );
}
