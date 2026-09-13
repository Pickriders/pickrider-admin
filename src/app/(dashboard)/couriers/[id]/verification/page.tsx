"use client";

import { ArrowLeft, Check, ExternalLink, FileText, Maximize2, PauseCircle, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { Badge, Button, ConfirmDialog, Drawer, ErrorState, Field, Input, KeyValue, LinkButton, PageHeader, Panel, PanelHeader, Skeleton, Textarea, cx } from "@/components/kit";
import { phoneLabel } from "@/components/users/user-actions";
import { LICENCE_LABEL, licenceOf, licenceTone } from "@/components/users/user-panels";
import { users, type KycStatus, type User } from "@/lib/admin/api";
import { day, fullName, when } from "@/lib/admin/format";
import { useAction, useUser } from "@/lib/admin/hooks";

/**
 * Driver's licence review. Approve (PATCH drivers-license/approve when the
 * rider submitted one, otherwise drivers-license/update with APPROVE), reject
 * or suspend with a comment (drivers-license/update), and re-run the licence
 * number check (drivers-license/verify) when the number or document needs
 * fixing from the admin side.
 */
const REJECT_REASONS = ["Licence not valid", "Licence mismatch", "Unable to verify licence number", "Document unclear or unreadable", "Other"];

function licenceInvalidations(userId: string) {
  return [["user", userId], ["stats", "user-overview"], "users", ["stats", "attention"]];
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function DocumentPanel({ doc, loading }: { doc: string; loading: boolean }) {
  const [broken, setBroken] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setBroken(false), [doc]);
  return (
    <Panel>
      <PanelHeader
        title="Licence document"
        subtitle="Uploaded from the rider app"
        action={
          doc ? (
            <LinkButton href={doc} external size="sm" icon={ExternalLink}>
              Open
            </LinkButton>
          ) : null
        }
      />
      <div className="px-5 pb-5 pt-4">
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : !doc ? (
          <div className="grid h-80 place-items-center rounded-xl border border-dashed border-line text-sm text-ink-faint">No document uploaded yet.</div>
        ) : broken ? (
          <div className="grid h-80 place-items-center rounded-xl border border-dashed border-line bg-surface text-center text-sm text-ink-muted">
            <div className="space-y-2 px-6">
              <p>The document could not be displayed here.</p>
              <a href={doc} target="_blank" rel="noreferrer" className="font-bold text-brand-dark underline">
                Open it in a new tab
              </a>
            </div>
          </div>
        ) : (
          <div className="relative grid h-80 place-items-center overflow-hidden rounded-xl border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc} alt="Driver's licence" className="h-full w-full object-contain" onError={() => setBroken(true)} />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Expand document"
              className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-lg bg-ink text-card shadow-pop transition-transform hover:scale-105"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        )}
      </div>
      <Drawer open={expanded} onClose={() => setExpanded(false)} title="Licence document" width="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc} alt="Driver's licence, full size" className="mx-auto max-h-[80vh] w-auto max-w-full rounded-xl object-contain" />
      </Drawer>
    </Panel>
  );
}

function RejectDrawer({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) {
      setSelected([]);
      setNote("");
    }
  }, [open]);
  const toggle = (reason: string) => setSelected((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
  const comment = [...selected.filter((r) => r !== "Other"), note.trim()].filter(Boolean).join("; ");
  const action = useAction((body: { status: KycStatus; comment?: string }) => users.licenceUpdate(user._id, body), {
    success: "Licence rejected",
    invalidate: licenceInvalidations(user._id),
    onSuccess: onClose,
  });
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Reject licence"
      subtitle="The rider sees the reasons in the app and can resubmit."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={action.isPending}>
            Cancel
          </Button>
          <Button variant="danger" loading={action.isPending} disabled={!comment} onClick={() => action.mutate({ status: "DISAPPROVE", comment })}>
            Reject licence
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ul className="space-y-2">
          {REJECT_REASONS.map((reason) => {
            const on = selected.includes(reason);
            return (
              <li key={reason}>
                <button
                  type="button"
                  onClick={() => toggle(reason)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    on ? "border-danger bg-danger-soft text-danger" : "border-line text-ink hover:bg-surface",
                  )}
                >
                  <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-md border", on ? "border-danger bg-danger text-white" : "border-line-strong")}>
                    {on ? <Check size={13} /> : null}
                  </span>
                  {reason}
                </button>
              </li>
            );
          })}
        </ul>
        <Field label="Note to the rider" hint={selected.includes("Other") ? "Required when the reason is Other." : "Optional detail."}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="The photo is cropped, please upload the full card." />
        </Field>
      </div>
    </Drawer>
  );
}

function VerifyDrawer({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const licence = licenceOf(user);
  const [number, setNumber] = useState("");
  const [doc, setDoc] = useState<string>("");
  const [fileName, setFileName] = useState("");
  useEffect(() => {
    if (open) {
      setNumber(licence.number);
      setDoc("");
      setFileName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const action = useAction(
    (body: { licenseNumber: string; licenseDocument?: string; businessId?: string }) => users.licenceVerify(user._id, body),
    {
      success: (data) => (data?.driversLicenseVerified === "APPROVE" ? "Licence number checked and approved" : "Licence saved, the number did not pass the automatic check"),
      invalidate: licenceInvalidations(user._id),
      onSuccess: onClose,
    },
  );
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setDoc(await readAsDataUrl(file));
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Check licence number"
      subtitle="Runs the licence check with this number. It is approved automatically when the check passes."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={action.isPending}>
            Cancel
          </Button>
          <Button
            loading={action.isPending}
            disabled={!number.trim()}
            onClick={() => action.mutate({ licenseNumber: number.trim(), licenseDocument: doc || undefined, businessId: user.businessId || undefined })}
          >
            Run check
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Licence number" hint={licence.number ? `Currently ${licence.number}` : "Nothing on file yet."}>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ABC12345AB12" autoComplete="off" />
        </Field>
        <Field label="Replace document (optional)" hint={fileName ? `Selected ${fileName}` : "Image of the licence card. Leave empty to keep the current one."}>
          <Input type="file" accept="image/*" onChange={(e) => void onFile(e.target.files?.[0])} className="py-1.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-2 file:text-xs file:font-semibold file:text-ink" />
        </Field>
      </div>
    </Drawer>
  );
}

function Verification({ id }: { id: string }) {
  const user = useUser(id);
  const u = user.data;
  const licence = licenceOf(u);
  const [dialog, setDialog] = useState<null | "approve" | "reject" | "suspend" | "verify">(null);
  const [comment, setComment] = useState("");
  useEffect(() => setComment(""), [dialog]);
  const close = () => setDialog(null);

  const approve = useAction(
    async () => (licence.status === "SUBMITTED" ? users.licenceApprove(id, {}) : users.licenceUpdate(id, { status: "APPROVE", comment: comment.trim() || "Approved by admin" })),
    { success: "Licence approved", invalidate: licenceInvalidations(id), onSuccess: close },
  );
  const suspend = useAction((body: { status: KycStatus; comment?: string }) => users.licenceUpdate(id, body), {
    success: "Licence suspended",
    invalidate: licenceInvalidations(id),
    onSuccess: close,
  });

  if (user.error && !u) {
    return (
      <div>
        <PageHeader breadcrumb={<Link href="/couriers">Couriers</Link>} title="Licence verification" />
        <ErrorState message="Could not load this rider." onRetry={() => user.refetch()} />
      </div>
    );
  }

  const canApprove = licence.status !== "APPROVE" && Boolean(licence.number);
  const raw = (u ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={
          <Link href={`/couriers/${id}/details`} className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={12} /> Back to rider
          </Link>
        }
        title="Licence verification"
        description={u ? `${fullName(u) || "Rider"} · ${phoneLabel(u.phone)}` : undefined}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <DocumentPanel doc={licence.doc} loading={user.isLoading} />

        <Panel>
          <PanelHeader
            title="Review"
            subtitle="What is on file and what to do with it"
            action={u ? <Badge tone={licenceTone(licence.status)}>{LICENCE_LABEL[licence.status]}</Badge> : null}
          />
          <div className="px-5 pb-5 pt-4">
            {user.isLoading || !u ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-5">
                <KeyValue
                  columns={2}
                  items={[
                    { label: "Licence number", value: licence.number || undefined },
                    { label: "Phone", value: phoneLabel(u.phone) || undefined },
                    { label: "Name on account", value: fullName(u) || undefined },
                    { label: "Date of birth", value: typeof raw.dob === "string" && raw.dob ? day(raw.dob) : undefined },
                    { label: "NIN", value: u.nin },
                    { label: "Rider since", value: day(u.createdAt) },
                  ]}
                />
                {licence.comment ? (
                  <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                    <p className="text-xs font-semibold text-ink-muted">Last review note</p>
                    <p className="mt-0.5 text-ink">{licence.comment}</p>
                    {u.updatedAt ? <p className="mt-1 text-xs text-ink-faint">{when(u.updatedAt)}</p> : null}
                  </div>
                ) : null}

                {licence.status === "APPROVE" ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success">This rider&apos;s licence is verified.</div>
                    <Button variant="outline" icon={PauseCircle} className="text-danger" onClick={() => setDialog("suspend")}>
                      Suspend licence
                    </Button>
                  </div>
                ) : licence.number ? (
                  <div className="space-y-3">
                    {licence.status !== "SUBMITTED" ? (
                      <p className="text-xs text-ink-muted">
                        This licence is marked <span className="font-semibold text-ink">{LICENCE_LABEL[licence.status].replace("Licence ", "")}</span>. You can still approve or reject it.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button icon={Check} disabled={!canApprove} onClick={() => setDialog("approve")}>
                        Approve licence
                      </Button>
                      <Button variant="outline" icon={X} className="text-danger" onClick={() => setDialog("reject")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface px-4 py-3 text-sm text-ink-muted">This rider has not added a driver&apos;s licence yet.</div>
                )}

                <div className="border-t border-line pt-4">
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setDialog("verify")}>
                    {licence.number ? "Fix number or re-run the check" : "Enter licence number"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {u ? (
        <>
          <ConfirmDialog
            open={dialog === "approve"}
            onClose={close}
            loading={approve.isPending}
            title="Approve this licence?"
            description={`${fullName(u) || "This rider"} will be marked licence-verified and can take orders that require it.`}
            confirmLabel="Approve"
            onConfirm={() => approve.mutate(undefined)}
          >
            {licence.status !== "SUBMITTED" ? (
              <Field label="Note" hint="Optional, saved on the record.">
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Checked manually against the FRSC portal" />
              </Field>
            ) : null}
          </ConfirmDialog>
          <ConfirmDialog
            open={dialog === "suspend"}
            onClose={close}
            loading={suspend.isPending}
            tone="danger"
            title="Suspend this licence?"
            description="The rider loses licence-verified status until it is approved again."
            confirmLabel="Suspend licence"
            onConfirm={() => suspend.mutate({ status: "SUSPENDED", comment: comment.trim() || undefined })}
          >
            <Field label="Reason" hint="Shown to the rider.">
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Licence reported expired" />
            </Field>
          </ConfirmDialog>
          <RejectDrawer user={u} open={dialog === "reject"} onClose={close} />
          <VerifyDrawer user={u} open={dialog === "verify"} onClose={close} />
        </>
      ) : null}
    </div>
  );
}

export default function VerificationPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Verification id={params.id} />
    </Suspense>
  );
}
