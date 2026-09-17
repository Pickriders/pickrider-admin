"use client";

import { BadgeCheck, Ban, Car, ChevronLeft, ChevronRight, Expand, Pencil, ShieldOff, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { vehicles, type VehicleRecord } from "@/lib/admin/api";
import { fullName, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useAction, useBusiness, useUser, useVehicle } from "@/lib/admin/hooks";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  ErrorState,
  Field,
  KeyValue,
  LinkButton,
  PageHeader,
  Panel,
  PanelHeader,
  Skeleton,
  Textarea,
  cx,
  statusTone,
} from "@/components/kit";

import { VehicleFormDrawer } from "@/app/(dashboard)/vehicles/VehicleFormDrawer";
import { VEHICLE_TYPE_LABEL, VehicleStatusBadge } from "@/app/(dashboard)/vehicles/vehicle-shared";
import { useCan } from "@/lib/admin/use-can";

/**
 * One vehicle: photos, the registration fields, the courier who rides it, and
 * the verify / reject / suspend / delete controls. The single-vehicle route
 * returns the bare document, so courier and business load separately and
 * never block the page.
 */
const MIN_REASON = 15;

const REJECT_REASONS = [
  "Plate number does not match the photos",
  "Photos are unclear or incomplete",
  "Chassis or engine number could not be verified",
  "Vehicle documents are not valid",
];

const SUSPEND_REASONS = ["Vehicle registration has expired", "Vehicle is no longer in use", "Vehicle details need to be updated"];

function ReasonDrawer({
  open,
  onClose,
  title,
  description,
  presets,
  confirmLabel,
  loading,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  presets: string[];
  confirmLabel: string;
  loading: boolean;
  onSubmit: (reason: string) => void;
}) {
  const [preset, setPreset] = useState<string>("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (open) {
      setPreset("");
      setDetails("");
    }
  }, [open]);

  const reason = [preset, details.trim()].filter(Boolean).join(". ");
  const valid = reason.length >= MIN_REASON;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      width="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSubmit(reason)} disabled={!valid} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {presets.map((item) => {
            const active = preset === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setPreset(active ? "" : item)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  active ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-card text-ink hover:bg-surface",
                )}
              >
                <span className={cx("h-4 w-4 shrink-0 rounded-full border-2", active ? "border-brand bg-brand" : "border-line-strong")} />
                {item}
              </button>
            );
          })}
        </div>
        <Field
          label="Details"
          hint={`The courier sees this. At least ${MIN_REASON} characters in total.`}
          error={reason && !valid ? `${MIN_REASON - reason.length} more characters needed.` : undefined}
        >
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Anything specific to this vehicle" />
        </Field>
      </div>
    </Drawer>
  );
}

function Lightbox({ photos, index, onClose, onIndex }: { photos: string[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const step = useCallback(
    (delta: number) => {
      if (index == null || !photos.length) return;
      onIndex((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndex],
  );

  useEffect(() => {
    if (index == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, onClose, step]);

  if (index == null) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
        <X size={18} />
      </button>
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight size={18} />
          </button>
        </>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[index]} alt="" className="max-h-[90vh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      <span className="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
        {index + 1} of {photos.length}
      </span>
    </div>
  );
}

function VehicleVerification({ vehicleId }: { vehicleId: string }) {
  const { can } = useCan();
  const router = useRouter();
  const query = useVehicle(vehicleId);
  const vehicle = query.data as VehicleRecord | undefined;
  const courierId = typeof vehicle?.userId === "string" ? vehicle.userId : vehicle?.userId?._id ?? "";
  const businessId = typeof vehicle?.businessId === "string" ? vehicle.businessId : "";
  const courier = useUser(courierId);
  const business = useBusiness(businessId);

  const [dialog, setDialog] = useState<"verify" | "reject" | "suspend" | "delete" | "edit" | null>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const close = () => setDialog(null);

  const invalidate = [["vehicle", vehicleId], "vehicles", "stats"];
  const verify = useAction(() => vehicles.verify(vehicleId, courierId), { success: "Vehicle verified. The courier has been told.", invalidate, onSuccess: close });
  const reject = useAction((reason: string) => vehicles.reject(vehicleId, courierId, { reason }), { success: "Vehicle rejected.", invalidate, onSuccess: close });
  const suspend = useAction((reason: string) => vehicles.suspend(vehicleId, courierId, { reason }), { success: "Vehicle suspended.", invalidate, onSuccess: close });
  const remove = useAction(() => vehicles.remove(vehicleId), {
    success: "Vehicle deleted.",
    invalidate: ["vehicles", "stats"],
    onSuccess: () => router.push("/vehicles"),
  });

  if (query.error) {
    return (
      <div>
        <PageHeader title="Vehicle" breadcrumb={<Link href="/vehicles">Vehicles</Link>} />
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      </div>
    );
  }

  const photos = vehicle?.photos ?? [];
  const status = vehicle?.status;
  const courierName = fullName(courier.data) || (courier.isPending && courierId ? "" : "Unknown courier");
  const canAct = Boolean(courierId) && !vehicle?.isDeleted && can("vehicle.review");

  return (
    <div>
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link href="/vehicles" className="hover:text-ink">
              Vehicles
            </Link>
            <span>/</span>
            <span>Verification</span>
          </span>
        }
        title={
          vehicle ? (
            <span className="flex flex-wrap items-center gap-3">
              {vehicle.name || "Unnamed vehicle"}
              <VehicleStatusBadge status={status} />
              {vehicle.isDeleted ? <Badge tone="danger">Deleted</Badge> : null}
            </span>
          ) : (
            <Skeleton className="h-8 w-56" />
          )
        }
        description={vehicle ? `${[vehicle.make, vehicle.model].filter(Boolean).join(" ") || VEHICLE_TYPE_LABEL} · ${vehicle.plateNumber || "no plate"}` : undefined}
        actions={
          vehicle ? (
            <>
              {status !== "VERIFIED" ? (
                <Button icon={BadgeCheck} variant="success" onClick={() => setDialog("verify")} disabled={!canAct}>
                  Verify
                </Button>
              ) : null}
              {status !== "REJECTED" ? (
                <Button icon={Ban} variant="outline" onClick={() => setDialog("reject")} disabled={!canAct}>
                  Reject
                </Button>
              ) : null}
              {status === "VERIFIED" ? (
                <Button icon={ShieldOff} variant="outline" onClick={() => setDialog("suspend")} disabled={!canAct}>
                  Suspend
                </Button>
              ) : null}
              {can("vehicle.create") ? (
                <Button icon={Pencil} variant="outline" onClick={() => setDialog("edit")} disabled={!canAct}>
                  Edit
                </Button>
              ) : null}
              {can("vehicle.delete") ? (
                <Button icon={Trash2} variant="danger" onClick={() => setDialog("delete")} disabled={Boolean(vehicle.isDeleted)}>
                  Delete
                </Button>
              ) : null}
            </>
          ) : null
        }
      />

      {!courierId && vehicle ? (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          This vehicle has no courier attached, so it cannot be verified, rejected or suspended until one is assigned.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Photos" subtitle={photos.length ? `${photos.length} uploaded` : "Nothing uploaded"} />
            <div className="p-5 pt-3">
              {query.isPending ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="aspect-[4/3] w-full" />
                  ))}
                </div>
              ) : photos.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((src, index) => (
                    <button
                      key={`${index}-${src}`}
                      type="button"
                      onClick={() => setPhotoIndex(index)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                      <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-ink/80 text-card opacity-0 transition-opacity group-hover:opacity-100">
                        <Expand size={14} />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid place-items-center rounded-xl border border-dashed border-line py-10 text-center">
                  <Car size={22} className="text-ink-faint" />
                  <p className="mt-2 text-sm font-semibold text-ink">No photos</p>
                  <p className="text-xs text-ink-muted">The courier has not uploaded any pictures of this vehicle.</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Registration" subtitle="As submitted by the courier" />
            <div className="p-5 pt-3">
              {query.isPending ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : (
                <KeyValue
                  columns={2}
                  items={[
                    { label: "Type", value: VEHICLE_TYPE_LABEL },
                    { label: "Name", value: vehicle?.name },
                    { label: "Make", value: vehicle?.make },
                    { label: "Model", value: vehicle?.model },
                    { label: "Colour", value: vehicle?.color ? <span className="capitalize">{vehicle.color}</span> : undefined },
                    { label: "Plate number", value: vehicle?.plateNumber ? <span className="font-mono uppercase">{vehicle.plateNumber}</span> : undefined },
                    { label: "Engine number", value: vehicle?.engineNumber ? <span className="font-mono">{vehicle.engineNumber}</span> : undefined },
                    { label: "Chassis number", value: vehicle?.chasisNumber ? <span className="font-mono">{vehicle.chasisNumber}</span> : undefined },
                  ]}
                />
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Review" subtitle="Latest decision on this vehicle" />
            <div className="p-5 pt-3">
              {query.isPending ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <KeyValue
                  columns={2}
                  items={[
                    { label: "Status", value: <VehicleStatusBadge status={status} /> },
                    { label: "Last reviewed", value: vehicle?.verifiedAt ? when(vehicle.verifiedAt) : undefined },
                    { label: "Comment", value: vehicle?.statusComment },
                    { label: "Submitted", value: when(vehicle?.createdAt) },
                    { label: "Last updated", value: vehicle?.updatedAt ? when(vehicle.updatedAt) : undefined },
                    { label: "Deleted", value: vehicle?.isDeleted ? when(vehicle.deletedAt) || "Yes" : "No" },
                  ]}
                />
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Courier" />
            <div className="p-5 pt-3">
              {!courierId && !query.isPending ? (
                <p className="text-sm text-ink-muted">Not assigned to anyone.</p>
              ) : courier.isPending ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ) : courier.error ? (
                <p className="text-sm text-ink-muted">Could not load the courier. {errorMessage(courier.error)}</p>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <Avatar src={courier.data?.photo} name={courierName} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{courierName}</p>
                      <p className="truncate text-xs text-ink-muted">{courier.data?.phone || courier.data?.email || ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {courier.data?.status ? <Badge tone={statusTone(courier.data.status.toLowerCase())}>{courier.data.status.toLowerCase()}</Badge> : null}
                    {courier.data?.isOnline ? (
                      <Badge tone="success" dot>
                        Online
                      </Badge>
                    ) : null}
                    {courier.data?.driversLicenseVerified ? (
                      <Badge tone={courier.data.driversLicenseVerified === "APPROVE" ? "success" : "warning"}>
                        Licence {courier.data.driversLicenseVerified === "APPROVE" ? "approved" : courier.data.driversLicenseVerified.toLowerCase()}
                      </Badge>
                    ) : null}
                  </div>
                  <LinkButton href={`/couriers/${courierId}/details`} size="sm" className="mt-4 w-full">
                    Open courier
                  </LinkButton>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Business" />
            <div className="p-5 pt-3">
              {!businessId ? (
                <p className="text-sm text-ink-muted">Independent courier, not registered under a business.</p>
              ) : business.isPending ? (
                <Skeleton className="h-10 w-full" />
              ) : business.error ? (
                <p className="text-sm text-ink-muted">Could not load the business.</p>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <Avatar src={(business.data?.photo as string | undefined) ?? business.data?.logo} name={business.data?.name} size={40} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{business.data?.name}</p>
                      <p className="truncate text-xs text-ink-muted">{business.data?.businessHandle ? `@${business.data.businessHandle}` : business.data?.email}</p>
                    </div>
                  </div>
                  <LinkButton href={`/business/${businessId}/business-details`} size="sm" className="mt-4 w-full">
                    Open business
                  </LinkButton>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <Lightbox photos={photos} index={photoIndex} onClose={() => setPhotoIndex(null)} onIndex={setPhotoIndex} />

      <ConfirmDialog
        open={dialog === "verify"}
        onClose={close}
        onConfirm={() => verify.mutate(undefined)}
        loading={verify.isPending}
        title="Verify this vehicle?"
        description={`${courierName || "The courier"} will be told the vehicle is approved and can start taking orders on it.`}
        confirmLabel="Verify"
      />

      <ReasonDrawer
        open={dialog === "reject"}
        onClose={close}
        title="Reject vehicle"
        description="Pick a reason, add details if useful. The courier can fix the issue and resubmit."
        presets={REJECT_REASONS}
        confirmLabel="Reject"
        loading={reject.isPending}
        onSubmit={(reason) => reject.mutate(reason)}
      />

      <ReasonDrawer
        open={dialog === "suspend"}
        onClose={close}
        title="Suspend vehicle"
        description="The vehicle stops being valid for deliveries until it is verified again."
        presets={SUSPEND_REASONS}
        confirmLabel="Suspend"
        loading={suspend.isPending}
        onSubmit={(reason) => suspend.mutate(reason)}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        onClose={close}
        onConfirm={() => remove.mutate(undefined)}
        loading={remove.isPending}
        tone="danger"
        title="Delete this vehicle?"
        description="It disappears from the courier's profile and from every list. This cannot be undone from the admin."
        confirmLabel="Delete"
      />

      <VehicleFormDrawer open={dialog === "edit"} onClose={close} vehicle={vehicle ?? null} userId={courierId || undefined} />
    </div>
  );
}

export default function VehicleVerificationPage({ params }: { params: { id: string } }) {
  return <VehicleVerification vehicleId={params.id} />;
}
