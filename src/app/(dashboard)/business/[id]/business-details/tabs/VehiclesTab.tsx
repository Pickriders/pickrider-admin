"use client";

import { Car } from "lucide-react";
import { useMemo } from "react";

import type { Paged, VehicleRecord } from "@/lib/admin/api";
import { errorMessage } from "@/lib/admin/http";
import { useBusinessVehicles } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { DataTable } from "@/components/kit";

import { VEHICLE_STATUS_OPTIONS, VehicleMobileCard, vehicleColumns } from "@/app/(dashboard)/vehicles/vehicle-shared";

/** Vehicles registered under the business, from GET businesses/:id/vehicles. */
export function VehiclesTab({ businessId }: { businessId: string }) {
  const table = useTableState();
  const query = useMemo(() => ({ ...table.query, vehicleSearch: table.state.search }), [table.query, table.state.search]);
  const data = useBusinessVehicles(businessId, query);
  const columns = useMemo(() => vehicleColumns(), []);

  return (
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
      csvName="business-vehicles"
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      rowHref={(row) => `/vehicles/${row._id}/verification`}
      mobileCard={(row) => <VehicleMobileCard vehicle={row} />}
      emptyIcon={Car}
      emptyTitle="No vehicles"
      emptyDescription="Vehicles the business registers from the business app show up here."
    />
  );
}
