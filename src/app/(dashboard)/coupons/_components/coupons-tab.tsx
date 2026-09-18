"use client";

import { Plus, Ticket } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, DataTable } from "@/components/kit";
import type { Coupon, Paged } from "@/lib/admin/api";
import { useCoupons } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { CouponFormDrawer } from "./coupon-form-drawer";
import { COUPON_COLUMNS, CouponMobileCard, LIFECYCLE_OPTIONS } from "./shared";

export function CouponsTab({ canManage }: { canManage: boolean }) {
  const table = useTableState({ sortBy: "createdAt", order: "DESC" });
  const [creating, setCreating] = useState(false);

  const query = useMemo(() => {
    const { page, limit, sortBy, order } = table.query;
    // Badge rewards are one coupon per customer per badge — noise in the promo list unless asked for.
    const { rewards, ...filters } = table.state.filters;
    return { page, limit, sortBy, order, ...filters, rewards: rewards ?? "false", search: table.state.search };
  }, [table.query, table.state.filters, table.state.search]);
  const data = useCoupons(query);

  return (
    <div>
      <DataTable<Coupon>
        columns={COUPON_COLUMNS}
        data={data.data as Paged<Coupon> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Code or name"
        dateFilter={false}
        filters={[
          { key: "lifecycle", label: "Status", options: LIFECYCLE_OPTIONS },
          {
            key: "type",
            label: "Type",
            options: [
              { value: "PERCENTAGE", label: "Percentage" },
              { value: "FIXED", label: "Fixed amount" },
            ],
          },
          {
            key: "isGeneral",
            label: "Audience",
            options: [
              { value: "true", label: "Everyone" },
              { value: "false", label: "Targeted (groups)" },
            ],
          },
          {
            key: "rewards",
            label: "Kind",
            options: [
              { value: "false", label: "Promotions" },
              { value: "true", label: "Badge rewards" },
            ],
          },
        ]}
        csvName="coupons"
        defaultSort={{ sortBy: "createdAt", order: "DESC" }}
        rowHref={(row) => `/coupons/${row._id}`}
        mobileCard={(row) => <CouponMobileCard coupon={row} />}
        emptyIcon={Ticket}
        emptyTitle="No coupons match"
        emptyDescription="Create a coupon and customers can apply it at checkout."
        toolbarExtra={
          canManage ? (
            <Button icon={Plus} onClick={() => setCreating(true)}>
              New coupon
            </Button>
          ) : undefined
        }
      />
      <CouponFormDrawer open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
