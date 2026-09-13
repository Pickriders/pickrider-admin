"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";

import { vehicles, type VehicleInput, type VehicleRecord } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";
import { Button, Drawer, Field, Input } from "@/components/kit";

/**
 * Add or replace a courier's vehicle through POST admins/vehicles/:userId/create.
 * The core keeps one vehicle per courier: saving upserts by userId and puts the
 * vehicle back to "pending review", so the same form covers add and edit.
 */
const MAX_PHOTOS = 5;
const MIN_PHOTOS = 2;

type Draft = Omit<VehicleInput, "photos"> & { userId: string };

const EMPTY: Draft = { userId: "", name: "", plateNumber: "", make: "", model: "", color: "", chasisNumber: "", engineNumber: "" };

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function VehicleFormDrawer({
  open,
  onClose,
  vehicle,
  userId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Existing vehicle to edit; omit to add one. */
  vehicle?: VehicleRecord | null;
  /** Locks the courier when opened from a courier or vehicle page. */
  userId?: string;
  onSaved?: (saved: VehicleRecord) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [photos, setPhotos] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFileError(null);
    setDraft({
      userId: userId ?? (typeof vehicle?.userId === "string" ? vehicle.userId : vehicle?.userId?._id ?? ""),
      name: vehicle?.name ?? "",
      plateNumber: vehicle?.plateNumber ?? "",
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      color: vehicle?.color ?? "",
      chasisNumber: vehicle?.chasisNumber ?? "",
      engineNumber: vehicle?.engineNumber ?? "",
    });
    setPhotos(vehicle?.photos ?? []);
  }, [open, vehicle, userId]);

  const save = useAction(
    (input: { userId: string; body: VehicleInput }) => vehicles.create(input.userId, input.body) as Promise<VehicleRecord>,
    {
      success: vehicle ? "Vehicle updated. It is back in the review queue." : "Vehicle added and queued for review.",
      invalidate: ["vehicles", "stats", ...(vehicle ? [["vehicle", vehicle._id]] : [])],
      onSuccess: (saved) => {
        onClose();
        onSaved?.(saved);
      },
    },
  );

  const set = (key: keyof Draft) => (event: ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [key]: event.target.value }));

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      setFileError(`At most ${MAX_PHOTOS} photos.`);
      return;
    }
    setFileError(null);
    try {
      const urls = await Promise.all(files.map(readAsDataUrl));
      setPhotos((p) => [...p, ...urls]);
    } catch {
      setFileError("Could not read one of the files.");
    }
  };

  const chassisOk = draft.chasisNumber.trim().length >= 15 && draft.chasisNumber.trim().length <= 20;
  const valid =
    draft.userId.trim() &&
    draft.name.trim() &&
    draft.plateNumber.trim().length >= 4 &&
    draft.make.trim().length >= 4 &&
    draft.model.trim().length >= 4 &&
    chassisOk &&
    draft.engineNumber.trim() &&
    photos.length >= MIN_PHOTOS &&
    photos.length <= MAX_PHOTOS;

  const submit = () => {
    if (!valid) return;
    const { userId: courier, color, ...rest } = draft;
    const body: VehicleInput = {
      ...rest,
      name: rest.name.trim(),
      plateNumber: rest.plateNumber.trim().toUpperCase(),
      make: rest.make.trim(),
      model: rest.model.trim(),
      chasisNumber: rest.chasisNumber.trim(),
      engineNumber: rest.engineNumber.trim(),
      photos,
      ...(color?.trim() ? { color: color.trim() } : {}),
    };
    save.mutate({ userId: courier.trim(), body });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={vehicle ? "Edit vehicle" : "Add vehicle"}
      subtitle="Saving sends the vehicle back to the review queue."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid} loading={save.isPending}>
            {vehicle ? "Save changes" : "Add vehicle"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Courier user id" hint={userId ? undefined : "Paste the courier's id from their profile page."}>
          <Input value={draft.userId} onChange={set("userId")} disabled={Boolean(userId)} placeholder="64f1c2…" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={draft.name} onChange={set("name")} placeholder="Red Bajaj" />
          </Field>
          <Field label="Plate number" hint="At least 4 characters.">
            <Input value={draft.plateNumber} onChange={set("plateNumber")} placeholder="ENU 123 AB" />
          </Field>
          <Field label="Make" hint="At least 4 characters.">
            <Input value={draft.make} onChange={set("make")} placeholder="Bajaj" />
          </Field>
          <Field label="Model" hint="At least 4 characters.">
            <Input value={draft.model} onChange={set("model")} placeholder="Boxer 150" />
          </Field>
          <Field label="Colour">
            <Input value={draft.color ?? ""} onChange={set("color")} placeholder="Red" />
          </Field>
          <Field label="Engine number">
            <Input value={draft.engineNumber} onChange={set("engineNumber")} />
          </Field>
        </div>
        <Field label="Chassis number" hint="15 to 20 characters." error={draft.chasisNumber && !chassisOk ? "Chassis numbers are 15 to 20 characters." : undefined}>
          <Input value={draft.chasisNumber} onChange={set("chasisNumber")} />
        </Field>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-muted">
            Photos <span className="font-normal text-ink-faint">({MIN_PHOTOS} to {MAX_PHOTOS})</span>
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((src, index) => (
              <div key={`${index}-${src.slice(0, 24)}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setPhotos((p) => p.filter((_, i) => i !== index))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-card opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS ? (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-line-strong bg-surface text-ink-muted transition-colors hover:border-brand hover:text-brand-dark">
                <input type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />
                <span className="flex flex-col items-center gap-1 text-xs font-semibold">
                  <ImagePlus size={18} />
                  Add
                </span>
              </label>
            ) : null}
          </div>
          {fileError ? <p className="mt-1 text-xs font-medium text-danger">{fileError}</p> : null}
        </div>
      </div>
    </Drawer>
  );
}
