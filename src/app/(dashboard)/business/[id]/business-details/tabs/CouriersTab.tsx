"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Bike, ShieldOff, ShieldCheck, UserMinus } from "lucide-react";
import { useMemo, useState } from "react";

import { businesses, type Paged, type User } from "@/lib/admin/api";
import { ago, fullName, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useAction, useBusinessUsers } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { Avatar, Badge, Button, ConfirmDialog, DataTable, statusTone, type ColumnMeta } from "@/components/kit";

/**
 * The couriers a business has enrolled. Suspend and unsuspend hit the
 * business-scoped routes, so the rider keeps their platform account; remove
 * detaches them from this business.
 */
type Pending = { kind: "suspend" | "unsuspend" | "remove"; user: User } | null;

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));

function licenceBadge(user: User) {
  const status = user.driversLicenseVerified;
  if (!status) return <span className="text-xs text-ink-faint">No licence</span>;
  const tone = status === "APPROVE" ? "success" : status === "DISAPPROVE" || status === "SUSPENDED" ? "danger" : "warning";
  const label = status === "APPROVE" ? "Approved" : status === "DISAPPROVE" ? "Rejected" : status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge tone={tone}>{label}</Badge>;
}

export function CouriersTab({ businessId }: { businessId: string }) {
  const table = useTableState();
  const [pending, setPending] = useState<Pending>(null);
  const query = useMemo(() => ({ ...table.query, userSearch: table.state.search }), [table.query, table.state.search]);
  const data = useBusinessUsers(businessId, query);

  const invalidate = [["business", businessId], "users", "stats"];
  const close = () => setPending(null);
  const suspend = useAction((userId: string) => businesses.suspendUser(businessId, userId), { success: "Courier suspended for this business.", invalidate, onSuccess: close });
  const unsuspend = useAction((userId: string) => businesses.unsuspendUser(businessId, userId), { success: "Courier restored.", invalidate, onSuccess: close });
  const remove = useAction((userId: string) => businesses.removeUser(businessId, userId), { success: "Courier removed from the business.", invalidate, onSuccess: close });
  const busy = suspend.isPending || unsuspend.isPending || remove.isPending;

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      {
        id: "courier",
        header: "Courier",
        cell: ({ row }) => {
          const name = fullName(row.original) || row.original.email || "Courier";
          return (
            <div className="flex items-center gap-3">
              <Avatar src={row.original.photo} name={name} size={36} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{name}</p>
                <p className="truncate text-xs text-ink-muted">{row.original.phone || row.original.email || ""}</p>
              </div>
            </div>
          );
        },
        meta: { csv: { key: "name", label: "Courier", value: (r) => fullName(r as User) } } satisfies ColumnMeta,
      },
      {
        id: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-ink-muted">{row.original.email || ""}</span>,
        meta: { hideBelow: "xl", csv: { key: "email", label: "Email" } } satisfies ColumnMeta,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={statusTone(row.original.status?.toLowerCase())}>{row.original.status?.toLowerCase() ?? "unknown"}</Badge>
            {row.original.isOnline ? (
              <Badge tone="success" dot>
                Online
              </Badge>
            ) : null}
          </div>
        ),
        meta: { csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
      },
      {
        id: "licence",
        header: "Licence",
        cell: ({ row }) => licenceBadge(row.original),
        meta: { hideBelow: "lg", csv: { key: "driversLicenseVerified", label: "Licence" } } satisfies ColumnMeta,
      },
      {
        id: "lastLogin",
        header: "Last seen",
        cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{row.original.lastLoginDate ? ago(row.original.lastLoginDate) : "Never"}</span>,
        meta: { hideBelow: "lg", sortKey: "lastLoginDate", csv: { key: "lastLoginDate", label: "Last login" } } satisfies ColumnMeta,
      },
      {
        id: "joined",
        header: "Joined",
        cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
        meta: { hideBelow: "xl", sortKey: "createdAt", csv: { key: "createdAt", label: "Joined" } } satisfies ColumnMeta,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const user = row.original;
          const suspended = user.status === "SUSPENDED";
          return (
            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                icon={suspended ? ShieldCheck : ShieldOff}
                onClick={() => setPending({ kind: suspended ? "unsuspend" : "suspend", user })}
              >
                {suspended ? "Unsuspend" : "Suspend"}
              </Button>
              <Button size="sm" variant="ghost" icon={UserMinus} className="text-danger hover:text-danger" onClick={() => setPending({ kind: "remove", user })}>
                Remove
              </Button>
            </div>
          );
        },
        meta: { align: "right" } satisfies ColumnMeta,
      },
    ],
    [],
  );

  const target = pending?.user;
  const targetName = target ? fullName(target) || target.email || "this courier" : "";

  return (
    <>
      <DataTable<User>
        columns={columns}
        data={data.data as Paged<User> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Name, phone, email"
        dateFilter={false}
        filters={[
          { key: "status", label: "Status", options: STATUS_OPTIONS },
          {
            key: "isOnline",
            label: "Online",
            options: [
              { value: "true", label: "Online now" },
              { value: "false", label: "Offline" },
            ],
          },
        ]}
        csvName="business-couriers"
        defaultSort={{ sortBy: "createdAt", order: "DESC" }}
        rowHref={(row) => `/couriers/${row._id}/details`}
        mobileCard={(row) => {
          const name = fullName(row) || row.email || "Courier";
          const suspended = row.status === "SUSPENDED";
          return (
            <div className="flex items-start gap-3">
              <Avatar src={row.photo} name={name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-ink">{name}</p>
                  <Badge tone={statusTone(row.status?.toLowerCase())}>{row.status?.toLowerCase()}</Badge>
                </div>
                <p className="truncate text-xs text-ink-muted">{row.phone || row.email || ""}</p>
                <div className="mt-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => setPending({ kind: suspended ? "unsuspend" : "suspend", user: row })}>
                    {suspended ? "Unsuspend" : "Suspend"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-danger" onClick={() => setPending({ kind: "remove", user: row })}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          );
        }}
        emptyIcon={Bike}
        emptyTitle="No couriers"
        emptyDescription="Couriers show up here once the business enrols them from the business app."
      />

      <ConfirmDialog
        open={pending?.kind === "suspend"}
        onClose={close}
        onConfirm={() => target && suspend.mutate(target._id)}
        loading={busy}
        tone="danger"
        title={`Suspend ${targetName}?`}
        description="They stop receiving this business's orders until unsuspended. Their platform account is untouched."
        confirmLabel="Suspend"
      />
      <ConfirmDialog
        open={pending?.kind === "unsuspend"}
        onClose={close}
        onConfirm={() => target && unsuspend.mutate(target._id)}
        loading={busy}
        title={`Restore ${targetName}?`}
        description="They can take this business's orders again right away."
        confirmLabel="Unsuspend"
      />
      <ConfirmDialog
        open={pending?.kind === "remove"}
        onClose={close}
        onConfirm={() => target && remove.mutate(target._id)}
        loading={busy}
        tone="danger"
        title={`Remove ${targetName} from this business?`}
        description="They are detached from the business and its vehicles. Their courier account stays active."
        confirmLabel="Remove"
      />
    </>
  );
}
