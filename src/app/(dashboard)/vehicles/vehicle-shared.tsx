"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Car } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { VehicleRecord, VehicleStatus } from "@/lib/admin/api";
import { fullName, when } from "@/lib/admin/format";
import { Avatar, Badge, type ColumnMeta, type Tone } from "@/components/kit";

/**
 * Bits every vehicle table shares: status colouring, the column set, the
 * phone-width card. The platform runs motorbikes only, and the schema carries
 * no `type` field, so "Motorbike" is the one type shown.
 */
export const VEHICLE_TYPE_LABEL = "Motorbike";

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  PENDING: "Pending review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

const VEHICLE_TONE: Record<VehicleStatus, Tone> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

export const VEHICLE_STATUS_OPTIONS = (Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((value) => ({
  value,
  label: VEHICLE_STATUS_LABEL[value],
}));

export function VehicleStatusBadge({ status }: { status: VehicleStatus | string | undefined }) {
  const known = status && status in VEHICLE_TONE ? (status as VehicleStatus) : undefined;
  return (
    <Badge tone={known ? VEHICLE_TONE[known] : "neutral"} dot>
      {known ? VEHICLE_STATUS_LABEL[known] : status || "Unknown"}
    </Badge>
  );
}

/** Populated courier when the list joined it; otherwise nothing. */
export function vehicleCourier(vehicle: VehicleRecord) {
  if (vehicle.user && typeof vehicle.user === "object") return vehicle.user;
  if (vehicle.userId && typeof vehicle.userId === "object") return vehicle.userId;
  return null;
}

export function vehicleCourierId(vehicle: VehicleRecord): string | undefined {
  const courier = vehicleCourier(vehicle);
  if (courier?._id) return courier._id;
  return typeof vehicle.userId === "string" ? vehicle.userId : undefined;
}

export function VehicleThumb({ vehicle, size = 40 }: { vehicle: VehicleRecord; size?: number }) {
  const src = vehicle.photos?.[0];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="shrink-0 rounded-lg object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span className="grid shrink-0 place-items-center rounded-lg bg-surface text-ink-faint" style={{ width: size, height: size }}>
      <Car size={18} />
    </span>
  );
}

function stop(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export function vehicleColumns(options: { showBusiness?: boolean } = {}): ColumnDef<VehicleRecord, unknown>[] {
  const columns: ColumnDef<VehicleRecord, unknown>[] = [
    {
      id: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <VehicleThumb vehicle={row.original} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{row.original.name || "Unnamed vehicle"}</p>
            <p className="truncate text-xs uppercase tracking-wide text-ink-muted">{row.original.plateNumber || "No plate"}</p>
          </div>
        </div>
      ),
      meta: {
        csv: {
          key: "vehicle",
          label: "Vehicle",
          value: (r) => `${(r as VehicleRecord).name ?? ""} (${(r as VehicleRecord).plateNumber ?? "no plate"})`,
        },
      } satisfies ColumnMeta,
    },
    {
      id: "makeModel",
      header: "Make / model",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-ink">{row.original.make || "Unknown make"}</p>
          <p className="truncate text-xs text-ink-muted">{row.original.model || ""}</p>
        </div>
      ),
      meta: { hideBelow: "md", csv: { key: "make", label: "Make", value: (r) => `${(r as VehicleRecord).make ?? ""} ${(r as VehicleRecord).model ?? ""}`.trim() } } satisfies ColumnMeta,
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-ink">{VEHICLE_TYPE_LABEL}</p>
          {row.original.color ? <p className="truncate text-xs capitalize text-ink-muted">{row.original.color}</p> : null}
        </div>
      ),
      meta: { hideBelow: "lg", csv: { key: "color", label: "Colour" } } satisfies ColumnMeta,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <VehicleStatusBadge status={row.original.status} />,
      meta: { csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
    },
    {
      id: "courier",
      header: "Courier",
      cell: ({ row }) => {
        const courier = vehicleCourier(row.original);
        const id = vehicleCourierId(row.original);
        if (!courier && !id) return <span className="text-ink-faint">Unassigned</span>;
        const name = fullName(courier) || "Courier";
        return (
          <Link href={`/couriers/${id}/details`} onClick={stop} className="flex items-center gap-2 hover:underline">
            <Avatar src={courier?.photo} name={name} size={28} />
            <span className="min-w-0">
              <span className="block truncate text-ink">{name}</span>
              {courier?.phone ? <span className="block truncate text-xs text-ink-muted">{courier.phone}</span> : null}
            </span>
          </Link>
        );
      },
      meta: {
        hideBelow: "md",
        csv: { key: "courier", label: "Courier", value: (r) => fullName(vehicleCourier(r as VehicleRecord)) },
      } satisfies ColumnMeta,
    },
  ];

  if (options.showBusiness) {
    columns.push({
      id: "business",
      header: "Business",
      cell: ({ row }) => {
        const businessId = typeof row.original.businessId === "string" ? row.original.businessId : row.original.business?._id;
        if (!businessId) return <span className="text-ink-faint">Independent</span>;
        return (
          <Link href={`/business/${businessId}/business-details`} onClick={stop} className="text-brand-dark hover:underline">
            {row.original.business?.name ?? "View business"}
          </Link>
        );
      },
      meta: { hideBelow: "lg", csv: { key: "businessId", label: "Business id" } } satisfies ColumnMeta,
    });
  }

  columns.push({
    id: "createdAt",
    header: "Added",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
    meta: { hideBelow: "lg", sortKey: "createdAt", csv: { key: "createdAt", label: "Added" } } satisfies ColumnMeta,
  });

  return columns;
}

export function VehicleMobileCard({ vehicle, extra }: { vehicle: VehicleRecord; extra?: ReactNode }) {
  const courier = vehicleCourier(vehicle);
  return (
    <div className="flex items-start gap-3">
      <VehicleThumb vehicle={vehicle} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-ink">{vehicle.name || "Unnamed vehicle"}</p>
          <VehicleStatusBadge status={vehicle.status} />
        </div>
        <p className="text-xs uppercase tracking-wide text-ink-muted">{vehicle.plateNumber || "No plate"}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || VEHICLE_TYPE_LABEL}
          {courier ? ` · ${fullName(courier)}` : " · Unassigned"}
        </p>
        {extra}
      </div>
    </div>
  );
}
