"use client";

import { Car, Plus } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import type { Paged, VehicleRecord, VehicleStatus } from "@/lib/admin/api";
import { errorMessage } from "@/lib/admin/http";
import { useAttention, useVehicles } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { Button, DataTable, PageHeader, cx } from "@/components/kit";

import { VehicleFormDrawer } from "./VehicleFormDrawer";
import { VEHICLE_STATUS_LABEL, VEHICLE_STATUS_OPTIONS, VehicleMobileCard, vehicleColumns } from "./vehicle-shared";

/**
 * Every vehicle on the platform. Status chips sit above the table so the
 * review queue is one tap away; the sidebar badge counts the same queue.
 */
const CHIPS: { value: VehicleStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending verification" },
  { value: "VERIFIED", label: VEHICLE_STATUS_LABEL.VERIFIED },
  { value: "REJECTED", label: VEHICLE_STATUS_LABEL.REJECTED },
  { value: "SUSPENDED", label: VEHICLE_STATUS_LABEL.SUSPENDED },
];

function VehiclesList() {
  const table = useTableState();
  const [adding, setAdding] = useState(false);
  const attention = useAttention();

  const query = useMemo(() => ({ ...table.query, vehicleSearch: table.state.search }), [table.query, table.state.search]);
  const data = useVehicles(query);
  const columns = useMemo(() => vehicleColumns({ showBusiness: true }), []);
  const activeStatus = table.state.filters.status ?? "";
  const pending = attention.data?.vehiclesPendingVerification;
  const activeChip = CHIPS.find((c) => c.value === activeStatus);

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Every motorbike registered by a courier or a business, and where each one is in review."
        actions={
          <Button icon={Plus} onClick={() => setAdding(true)}>
            Add vehicle
          </Button>
        }
      />

      <div className="admin-scroll -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {CHIPS.map((chip) => {
          const active = activeStatus === chip.value;
          const count = chip.value === "PENDING" ? pending : undefined;
          return (
            <button
              key={chip.value || "all"}
              type="button"
              onClick={() => table.setFilter("status", chip.value || undefined)}
              className={cx(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active ? "border-transparent bg-ink text-card" : "border-line bg-card text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {chip.label}
              {count != null && count > 0 ? (
                <span className={cx("rounded-full px-1.5 text-[11px]", active ? "bg-card/20 text-card" : "bg-warning-soft text-warning")}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <DataTable<VehicleRecord>
        columns={columns}
        data={data.data as Paged<VehicleRecord> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Name, plate, chassis, courier"
        filters={[
          { key: "status", label: "Status", options: VEHICLE_STATUS_OPTIONS },
          {
            key: "isAssigned",
            label: "Courier",
            options: [
              { value: "true", label: "Assigned" },
              { value: "false", label: "Unassigned" },
            ],
          },
        ]}
        csvName="vehicles"
        defaultSort={{ sortBy: "createdAt", order: "DESC" }}
        rowHref={(row) => `/vehicles/${row._id}/verification`}
        mobileCard={(row) => <VehicleMobileCard vehicle={row} />}
        emptyIcon={Car}
        emptyTitle={activeChip?.value ? `No vehicles ${activeChip.label.toLowerCase()}` : "No vehicles yet"}
        emptyDescription="Vehicles appear here as couriers and businesses register them."
      />

      <VehicleFormDrawer open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehiclesList />
    </Suspense>
  );
}
