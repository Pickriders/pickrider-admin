"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Drawer,
  Field,
  Input,
  KeyValue,
  type ColumnMeta,
} from "@/components/kit";
import { coupons, type CouponGroup, type Paged } from "@/lib/admin/api";
import { count, fullName, when } from "@/lib/admin/format";
import { useAction, useCouponGroup, useCouponGroups } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { GroupFormDrawer } from "./group-form-drawer";

const meta = (value: ColumnMeta) => value;

const COLUMNS: ColumnDef<CouponGroup, unknown>[] = [
  {
    id: "name",
    header: "Group",
    meta: meta({ csv: { key: "name", label: "Group" } }),
    cell: ({ row }) => <span className="text-sm font-bold text-ink">{row.original.name}</span>,
  },
  {
    id: "coupons",
    header: "Coupons",
    meta: meta({
      csv: {
        key: "coupons",
        label: "Coupons",
        value: (row) => ((row as CouponGroup).coupons ?? []).map((c) => c.code).join(" "),
      },
    }),
    cell: ({ row }) => (
      <span className="flex flex-wrap gap-1">
        {(row.original.coupons ?? []).slice(0, 4).map((c) => (
          <Badge key={c._id} tone={c.isActive ? "brand" : "neutral"} className="font-mono">
            {c.code}
          </Badge>
        ))}
        {(row.original.coupons?.length ?? 0) > 4 ? (
          <Badge tone="neutral">+{(row.original.coupons?.length ?? 0) - 4}</Badge>
        ) : null}
      </span>
    ),
  },
  {
    id: "userCount",
    header: "Members",
    meta: meta({ align: "right", csv: { key: "userCount", label: "Members" } }),
    cell: ({ row }) => <span className="text-sm font-semibold text-ink">{count(row.original.userCount)}</span>,
  },
  {
    id: "createdAt",
    header: "Created",
    meta: meta({ align: "right", hideBelow: "md", csv: { key: "createdAt", label: "Created" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
];

/** Groups list; a row opens a drawer (`?group=`) where members are added/removed and the group edited. */
export function GroupsTab({ canManage }: { canManage: boolean }) {
  const table = useTableState();
  const [creating, setCreating] = useState(false);
  const selected = table.state.filters.group;

  const query = useMemo(() => {
    const { group: _group, ...filters } = table.state.filters;
    void _group;
    const { page, limit } = table.query;
    return { page, limit, ...filters, search: table.state.search };
  }, [table.query, table.state.filters, table.state.search]);
  const data = useCouponGroups(query);

  return (
    <div>
      <DataTable<CouponGroup>
        columns={COLUMNS}
        data={data.data as Paged<CouponGroup> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Group name"
        dateFilter={false}
        filters={[
          {
            key: "includeRewardGroups",
            label: "Show",
            options: [{ value: "true", label: "Include badge reward groups" }],
          },
        ]}
        csvName="coupon-groups"
        onRowClick={(row) => table.setFilter("group", row._id)}
        emptyIcon={Users}
        emptyTitle="No groups yet"
        emptyDescription="Group customers to target them with coupons only they can see."
        toolbarExtra={
          canManage ? (
            <Button icon={Plus} onClick={() => setCreating(true)}>
              New group
            </Button>
          ) : undefined
        }
      />
      <GroupFormDrawer open={creating} onClose={() => setCreating(false)} />
      {selected ? (
        <GroupDrawer id={selected} canManage={canManage} onClose={() => table.setFilter("group", undefined)} />
      ) : null}
    </div>
  );
}

function GroupDrawer({ id, canManage, onClose }: { id: string; canManage: boolean; onClose: () => void }) {
  const { data: group, isPending, error } = useCouponGroup(id);
  const [editing, setEditing] = useState(false);
  const [newIds, setNewIds] = useState("");
  const [removing, setRemoving] = useState<{ _id: string; name: string } | null>(null);
  const invalidate = [["coupon-group", id], "coupon-groups"];

  const add = useAction((ids: string[]) => coupons.addGroupUsers(id, ids), {
    success: "Members added.",
    invalidate,
    onSuccess: () => setNewIds(""),
  });
  const remove = useAction((ids: string[]) => coupons.removeGroupUsers(id, ids), {
    success: "Member removed.",
    invalidate,
    onSuccess: () => setRemoving(null),
  });

  const ids = newIds
    .split(/[\s,]+/)
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        width="lg"
        title={group?.name ?? "Group"}
        subtitle={
          group
            ? `${count(group.userCount)} member${group.userCount === 1 ? "" : "s"} · ${count(group.couponCount)} coupon${group.couponCount === 1 ? "" : "s"}`
            : undefined
        }
        footer={
          canManage ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setEditing(true)} disabled={!group}>
                Edit name and coupons
              </Button>
            </div>
          ) : undefined
        }
      >
        {isPending ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : error || !group ? (
          <p className="text-sm text-danger">{error ? errorMessage(error) : "Group not found"}</p>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-muted">Coupons</p>
              <div className="flex flex-wrap gap-1.5">
                {(group.coupons ?? []).map((c) => (
                  <a
                    key={c._id}
                    href={`/coupons/${c._id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-xs hover:border-line-strong"
                  >
                    <span className="font-mono font-bold text-ink">{c.code}</span>
                    <span className="text-ink-muted">{c.name}</span>
                    {!c.isActive ? <Badge tone="warning">Paused</Badge> : null}
                  </a>
                ))}
                {!group.coupons?.length ? <span className="text-xs text-ink-faint">None attached.</span> : null}
              </div>
            </div>

            {canManage ? (
              <Field label="Add members" hint="Customer user ids, comma or newline separated.">
                <div className="flex gap-2">
                  <Input
                    value={newIds}
                    onChange={(event) => setNewIds(event.target.value)}
                    placeholder="64f1c2…, 64f1c3…"
                    className="font-mono"
                  />
                  <Button onClick={() => ids.length && add.mutate(ids)} disabled={!ids.length} loading={add.isPending}>
                    Add
                  </Button>
                </div>
              </Field>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-semibold text-ink-muted">
                Members{" "}
                {group.users && group.userCount > group.users.length
                  ? `(showing ${group.users.length} of ${count(group.userCount)})`
                  : ""}
              </p>
              {group.users?.length ? (
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {group.users.map((member) => (
                    <li key={member._id} className="flex items-center gap-3 px-3 py-2">
                      <a href={`/customers/${member._id}`} className="min-w-0 flex-1 hover:underline">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {fullName(member) || member.email || member._id}
                        </span>
                        <span className="block truncate text-[11px] text-ink-muted">
                          {member.phone || member.email}
                        </span>
                      </a>
                      {canManage ? (
                        <button
                          type="button"
                          aria-label="Remove member"
                          onClick={() =>
                            setRemoving({ _id: member._id, name: fullName(member) || member.email || member._id })
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-surface hover:text-danger"
                        >
                          <X size={14} />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-ink-faint">No members yet.</p>
              )}
            </div>

            <KeyValue
              items={[
                { label: "Group id", value: <span className="font-mono text-xs">{group._id}</span> },
                { label: "Created", value: when(group.createdAt) },
              ]}
            />
          </div>
        )}
      </Drawer>

      <GroupFormDrawer open={editing} onClose={() => setEditing(false)} group={group} />

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate([removing._id])}
        title="Remove from group?"
        description={`${removing?.name ?? "This customer"} will no longer see the coupons attached to this group.`}
        confirmLabel="Remove"
        tone="danger"
        loading={remove.isPending}
      />
    </>
  );
}
