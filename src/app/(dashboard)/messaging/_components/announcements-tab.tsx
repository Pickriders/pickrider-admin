"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Archive, ArrowUpRight, Eye, MousePointerClick, Pause, Pencil, Play, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Badge, Button, ConfirmDialog, DataTable, Drawer, KeyValue, Pager, Skeleton, StatCard, cx, type ColumnMeta, type Tone } from "@/components/kit";
import { AnnouncementActionType, AnnouncementAudience, AnnouncementStatus, announcements, type Announcement } from "@/lib/admin/api";
import { count, fullName, percent, when } from "@/lib/admin/format";
import { useAction, useAnnouncement, useAnnouncementReceipts, useAnnouncements, useAnnouncementsSummary } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";
import { useCan } from "@/lib/admin/use-can";

import { AnnouncementFormDrawer } from "./announcement-form-drawer";
import { AnnouncementPreview } from "./announcement-preview";

/**
 * "What's new" popups for the apps. The list is the queue (draft, live, archived), a row opens
 * the detail drawer (`?id=`) with its numbers and who saw it; from there staff publish, pause,
 * archive or edit. Only drafts can be deleted — anything that went live keeps its history.
 */
const meta = (value: ColumnMeta) => value;

/** DataTable wants an index signature the generated interface does not carry. */
type AnnouncementRow = Announcement & Record<string, unknown>;

const STATUS_TONE: Record<string, Tone> = { DRAFT: "warning", ACTIVE: "success", ARCHIVED: "neutral" };
const STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", ACTIVE: "Live", ARCHIVED: "Archived" };
const AUDIENCE_LABEL: Record<string, string> = { CUSTOMERS: "Customers", RIDERS: "Couriers" };

function StatusBadge({ status }: { status: string | undefined }) {
  const key = status ?? "DRAFT";
  return (
    <Badge tone={STATUS_TONE[key] ?? "neutral"} dot>
      {STATUS_LABEL[key] ?? key}
    </Badge>
  );
}

function ActionCell({ action }: { action: Announcement["action"] }) {
  if (!action) return <span className="text-xs text-ink-faint">Got it only</span>;
  const external = action.type === AnnouncementActionType.EXTERNAL;
  return (
    <span className="block max-w-[14rem]">
      <span className="flex items-center gap-1 text-sm font-semibold text-ink">
        {action.label}
        {external ? <ArrowUpRight size={12} className="text-ink-muted" /> : null}
      </span>
      <span className="block truncate font-mono text-[11px] text-ink-muted">{action.target}</span>
    </span>
  );
}

/** How many people closed it for good, out of everyone it reached. */
function decidedShare(a: Announcement) {
  const decided = (a.stats?.acted ?? 0) + (a.stats?.confirmed ?? 0);
  return a.stats?.reached ? Math.round((decided / a.stats.reached) * 100) : 0;
}

const BASE_COLUMNS: ColumnDef<AnnouncementRow, unknown>[] = [
  {
    id: "title",
    header: "Announcement",
    meta: meta({ csv: { key: "title", label: "Title" } }),
    cell: ({ row }) => (
      <span className="flex max-w-[22rem] items-start gap-2">
        <span className="text-xl leading-none">{row.original.emoji || (row.original.imageUrl ? "🖼️" : "🎉")}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">{row.original.title}</span>
          <span className="block truncate text-[11px] text-ink-muted">{row.original.body}</span>
        </span>
      </span>
    ),
  },
  {
    id: "audience",
    header: "App",
    meta: meta({ csv: { key: "audience", label: "App" } }),
    cell: ({ row }) => <Badge tone="neutral">{AUDIENCE_LABEL[row.original.audience] ?? row.original.audience}</Badge>,
  },
  {
    id: "action",
    header: "Button",
    meta: meta({ hideBelow: "lg", csv: { key: "action", label: "Button", value: (row) => (row as Announcement).action?.target ?? "" } }),
    cell: ({ row }) => <ActionCell action={row.original.action} />,
  },
  {
    id: "reached",
    header: "Reached",
    meta: meta({ align: "right", csv: { key: "reached", label: "Reached", value: (row) => (row as Announcement).stats?.reached ?? 0 } }),
    cell: ({ row }) => <span className="text-sm font-semibold text-ink">{count(row.original.stats?.reached)}</span>,
  },
  {
    id: "acted",
    header: "Acted / got it",
    meta: meta({ align: "right", hideBelow: "md", csv: { key: "acted", label: "Acted", value: (row) => (row as Announcement).stats?.acted ?? 0 } }),
    cell: ({ row }) => (
      <span className="text-sm">
        <span className="font-semibold text-success">{count(row.original.stats?.acted)}</span>
        <span className="text-ink-faint"> / </span>
        <span className="font-semibold text-ink-muted">{count(row.original.stats?.confirmed)}</span>
      </span>
    ),
  },
  {
    id: "later",
    header: "Later",
    meta: meta({ align: "right", hideBelow: "xl", csv: { key: "later", label: "Later", value: (row) => (row as Announcement).stats?.later ?? 0 } }),
    cell: ({ row }) => <span className="text-sm text-ink-muted">{count(row.original.stats?.later)}</span>,
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ csv: { key: "status", label: "Status" } }),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "publishedAt",
    header: "Live since",
    meta: meta({ hideBelow: "lg", csv: { key: "publishedAt", label: "Live since" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{row.original.publishedAt ? when(row.original.publishedAt) : "Not published"}</span>,
  },
];

/** Row-level edit so a slip in the copy is one click away, whatever the status. */
function withEditColumn(columns: ColumnDef<AnnouncementRow, unknown>[], onEdit: (a: Announcement) => void, canManage: boolean) {
  if (!canManage) return columns;
  return [
    ...columns,
    {
      id: "edit",
      header: "",
      meta: meta({ align: "right", width: "3rem" }),
      cell: ({ row }) => (
        <button
          type="button"
          aria-label={`Edit ${row.original.title}`}
          title="Edit"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
        >
          <Pencil size={14} />
        </button>
      ),
    } satisfies ColumnDef<AnnouncementRow, unknown>,
  ];
}

const STATUS_CHIPS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: AnnouncementStatus.ACTIVE, label: "Live" },
  { value: AnnouncementStatus.DRAFT, label: "Drafts" },
  { value: AnnouncementStatus.ARCHIVED, label: "Archived" },
];

export function AnnouncementsTab() {
  const { can } = useCan();
  const canManage = can("announcement.manage");
  const table = useTableState({ limit: 20 });
  const selectedId = table.state.filters.id ?? "";
  const status = table.state.filters.status ?? "";
  const [composer, setComposer] = useState<{ open: boolean; editing: Announcement | null }>({ open: false, editing: null });
  const openEditor = (editing: Announcement | null) => setComposer({ open: true, editing });
  const columns = useMemo(() => withEditColumn(BASE_COLUMNS, openEditor, canManage), [canManage]);

  const query = useMemo(() => {
    const { page, limit } = table.query;
    return { page, limit, status: status || undefined, audience: table.state.filters.audience || undefined, search: table.state.search || undefined };
  }, [table.query, status, table.state.filters.audience, table.state.search]);
  const list = useAnnouncements(query);
  const summary = useAnnouncementsSummary();

  const openDetail = (id: string) => table.update({ id }, { resetPage: false });
  const closeDetail = () => table.update({ id: undefined }, { resetPage: false });

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Live now" value={summary.data ? count(summary.data.active) : ""} hint={summary.data ? `${count(summary.data.drafts)} drafts` : undefined} icon={Sparkles} loading={summary.isLoading} />
        <StatCard label="People reached" value={summary.data ? count(summary.data.reached) : ""} hint="Across live announcements" icon={Users} loading={summary.isLoading} />
        <StatCard label="Took the action" value={summary.data ? count(summary.data.acted) : ""} hint={summary.data ? `${count(summary.data.confirmed)} just closed it` : undefined} icon={MousePointerClick} loading={summary.isLoading} />
        <StatCard label="Action rate" value={summary.data ? percent(summary.data.actionRate, 0) : ""} hint="Of everyone who closed one" icon={Eye} loading={summary.isLoading} />
      </div>

      <DataTable<AnnouncementRow>
        columns={columns}
        data={list.data as import("@/lib/admin/api").Paged<AnnouncementRow> | undefined}
        loading={list.isLoading || list.isFetching}
        error={list.isError ? errorMessage(list.error) : null}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search title or message"
        dateFilter={false}
        filters={[
          {
            key: "audience",
            label: "App",
            options: [
              { value: AnnouncementAudience.CUSTOMERS, label: "Customers" },
              { value: AnnouncementAudience.RIDERS, label: "Couriers" },
            ],
          },
        ]}
        csvName="announcements"
        emptyIcon={Sparkles}
        emptyTitle="No announcements yet"
        emptyDescription="Tell people what's new, like a price calculator or scheduled orders, and it pops the next time they open the app."
        onRowClick={(row) => openDetail(row._id!)}
        toolbarExtra={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STATUS_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => table.update({ status: chip.value || undefined })}
                  className={cx(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    status === chip.value ? "border-transparent bg-ink text-card" : "border-line text-ink-muted hover:bg-surface",
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <Button icon={Plus} size="md" disabled={!canManage} onClick={() => openEditor(null)} className="w-full sm:w-auto">
              New announcement
            </Button>
          </div>
        }
        mobileCard={(row) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-bold text-ink">
                {row.emoji ? `${row.emoji} ` : ""}
                {row.title}
              </p>
              <StatusBadge status={row.status} />
            </div>
            <p className="line-clamp-2 text-xs text-ink-muted">{row.body}</p>
            <p className="text-[11px] text-ink-muted">
              {AUDIENCE_LABEL[row.audience]} · reached {count(row.stats?.reached)} · acted {count(row.stats?.acted)}
            </p>
          </div>
        )}
      />

      <AnnouncementDetailDrawer id={selectedId} onClose={closeDetail} canManage={canManage} onEdit={openEditor} />
      <AnnouncementFormDrawer
        open={composer.open}
        editing={composer.editing}
        onClose={() => setComposer((c) => ({ ...c, open: false }))}
        onSaved={(saved) => openDetail(saved._id!)}
      />
    </>
  );
}

function AnnouncementDetailDrawer({
  id,
  onClose,
  canManage,
  onEdit,
}: {
  id: string;
  onClose: () => void;
  canManage: boolean;
  onEdit: (a: Announcement) => void;
}) {
  const detail = useAnnouncement(id);
  const a = detail.data;
  const [confirm, setConfirm] = useState<null | "archive" | "delete" | "pause" | "publish" | "restore">(null);
  const [receiptsPage, setReceiptsPage] = useState(1);
  const receipts = useAnnouncementReceipts(id, { page: receiptsPage, limit: 10 });
  const invalidate = ["announcements", ["announcement", id]];

  const setStatus = useAction((status: AnnouncementStatus) => announcements.setStatus(id, status), {
    success: (saved, status) =>
      saved.status === AnnouncementStatus.ACTIVE ? "Announcement is live" : saved.status === AnnouncementStatus.ARCHIVED ? "Archived" : status === AnnouncementStatus.DRAFT && isArchived ? "Restored as a draft" : "Paused. It no longer pops",
    invalidate,
    onSuccess: () => setConfirm(null),
  });
  const remove = useAction(() => announcements.remove(id), {
    success: "Draft deleted",
    invalidate,
    onSuccess: () => {
      setConfirm(null);
      onClose();
    },
  });

  const isLive = a?.status === AnnouncementStatus.ACTIVE;
  const isDraft = a?.status === AnnouncementStatus.DRAFT;
  const isArchived = a?.status === AnnouncementStatus.ARCHIVED;

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      width="lg"
      title={a ? a.title : "Announcement"}
      subtitle={a ? `${AUDIENCE_LABEL[a.audience]} · ${STATUS_LABEL[a.status]}${a.publishedAt ? ` · live since ${when(a.publishedAt)}` : ""}` : undefined}
      footer={
        a && canManage ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" icon={Pencil} onClick={() => onEdit(a)}>
              Edit
            </Button>
            {isDraft ? (
              <Button variant="ghost" icon={Trash2} onClick={() => setConfirm("delete")}>
                Delete draft
              </Button>
            ) : null}
            {isArchived ? (
              <Button variant="outline" icon={Pause} onClick={() => setConfirm("restore")}>
                Restore as draft
              </Button>
            ) : (
              <Button variant="outline" icon={Archive} onClick={() => setConfirm("archive")}>
                Archive
              </Button>
            )}
            {isLive ? (
              <Button variant="outline" icon={Pause} onClick={() => setConfirm("pause")}>
                Pause
              </Button>
            ) : (
              <Button icon={Play} onClick={() => setConfirm("publish")}>
                Publish
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {detail.isError ? (
        <p className="text-sm font-semibold text-danger">{errorMessage(detail.error)}</p>
      ) : !a ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_15rem]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Reached" value={count(a.stats?.reached)} hint={`${count(a.stats?.impressions)} shows`} />
              <Stat label="Took action" value={count(a.stats?.acted)} tone="text-success" />
              <Stat label="Just closed it" value={count(a.stats?.confirmed)} />
              <Stat label="Show me later" value={count(a.stats?.later)} hint={`${decidedShare(a)}% decided`} />
            </div>

            <KeyValue
              items={[
                { label: "Button", value: <ActionCell action={a.action} /> },
                { label: "Window", value: a.startsAt || a.endsAt ? `${a.startsAt ? when(a.startsAt) : "now"} → ${a.endsAt ? when(a.endsAt) : "until archived"}` : "Always, while live" },
                { label: "Created", value: when(a.createdAt) },
                { label: "Updated", value: when(a.updatedAt) },
              ]}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-muted">Who saw it</p>
                {receipts.data ? <span className="text-[11px] text-ink-faint">{count(receipts.data.total)} people</span> : null}
              </div>
              {receipts.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : !receipts.data?.items.length ? (
                <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-faint">Nobody has been shown this yet.</p>
              ) : (
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {receipts.data.items.map((r) => (
                    <li key={r._id} className="flex items-center gap-3 px-3 py-2">
                      <Avatar src={r.user?.photo} name={fullName(r.user)} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{fullName(r.user) || r.userId}</span>
                        <span className="block truncate text-[11px] text-ink-muted">
                          shown {count(r.impressions)}× · later {count(r.later)}× · last {r.lastSeenAt ? when(r.lastSeenAt) : "never"}
                        </span>
                      </span>
                      {r.acknowledgedAt ? (
                        <Badge tone={r.outcome === "ACTED" ? "success" : "neutral"}>{r.outcome === "ACTED" ? "Acted" : "Got it"}</Badge>
                      ) : (
                        <Badge tone="warning">Still popping</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {receipts.data && receipts.data.totalPages > 1 ? (
                <div className="mt-2">
                  <Pager page={receipts.data.page} totalPages={receipts.data.totalPages} onPage={setReceiptsPage} />
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <AnnouncementPreview emoji={a.emoji} title={a.title} body={a.body} imageUrl={a.imageUrl} audience={a.audience} action={a.action} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm === "archive"}
        onClose={() => setConfirm(null)}
        onConfirm={() => setStatus.mutate(AnnouncementStatus.ARCHIVED)}
        loading={setStatus.isPending}
        title="Archive this announcement?"
        description="It stops popping right away and leaves the live list. You can restore or republish it later; the numbers stay."
        confirmLabel="Archive"
        tone="danger"
      />
      <ConfirmDialog
        open={confirm === "pause"}
        onClose={() => setConfirm(null)}
        onConfirm={() => setStatus.mutate(AnnouncementStatus.DRAFT)}
        loading={setStatus.isPending}
        title="Pause this announcement?"
        description="It stops popping in the app right away and goes back to being a draft. Publish it again whenever you like; the numbers stay."
        confirmLabel="Pause"
        tone="warning"
      />
      <ConfirmDialog
        open={confirm === "publish"}
        onClose={() => setConfirm(null)}
        onConfirm={() => setStatus.mutate(AnnouncementStatus.ACTIVE)}
        loading={setStatus.isPending}
        title="Publish this announcement?"
        description={a ? `It pops for every ${AUDIENCE_LABEL[a.audience].toLowerCase()} the next time they open the app.` : undefined}
        confirmLabel="Publish"
      />
      <ConfirmDialog
        open={confirm === "restore"}
        onClose={() => setConfirm(null)}
        onConfirm={() => setStatus.mutate(AnnouncementStatus.DRAFT)}
        loading={setStatus.isPending}
        title="Restore as a draft?"
        description="It comes back to the drafts list, unpublished, so you can edit it before it pops again."
        confirmLabel="Restore"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove.mutate(undefined)}
        loading={remove.isPending}
        title="Delete this draft?"
        description="It was never shown to anyone, so nothing is lost but the text."
        confirmLabel="Delete"
        tone="danger"
      />
    </Drawer>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-[11px] font-semibold text-ink-muted">{label}</p>
      <p className={cx("mt-0.5 text-xl font-black tracking-tight text-ink", tone)}>{value}</p>
      {hint ? <p className="text-[11px] text-ink-faint">{hint}</p> : null}
    </div>
  );
}
