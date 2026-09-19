"use client";

import { ArrowLeft, CheckCircle2, ExternalLink, MessageSquarePlus, RotateCcw, UserCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  Field,
  KeyValue,
  LinkButton,
  PageHeader,
  Panel,
  PanelHeader,
  Select,
  Skeleton,
  Textarea,
} from "@/components/kit";
import { issues, type Issue, type IssuePriority, type IssueStatus, type Person } from "@/lib/admin/api";
import { fullName, naira, when } from "@/lib/admin/format";
import { useAction, useIssue, useMe, useUsers } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { PLATFORM_STAFF_ROLES } from "@/lib/admin-access";

import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
  PersonCell,
  PriorityBadge,
  STATUS_LABEL,
  StatusBadge,
  isOverdue,
} from "../_components/shared";

/**
 * One report, end to end: what the customer said (with attachments and the order/transaction it
 * is about), who is on it, the internal notes trail, and the actions that move it along. Status
 * changes push the customer; notes never leave the admin.
 */
const NEXT: Record<IssueStatus, IssueStatus[]> = {
  OPEN: ["IN_REVIEW", "RESOLVED", "CLOSED"],
  IN_REVIEW: ["OPEN", "RESOLVED", "CLOSED"],
  RESOLVED: ["IN_REVIEW", "CLOSED"],
  CLOSED: [],
};

function personName(person?: Person | string | null) {
  if (!person || typeof person === "string") return "Staff";
  return fullName(person) || person.email || "Staff";
}

function IssueDetail({ id }: { id: string }) {
  const { data: issue, isPending, error, refetch } = useIssue(id);
  const me = useMe();
  const staff = useUsers({ role: PLATFORM_STAFF_ROLES.join(","), limit: 100, sortBy: "firstname", order: "ASC" });
  const invalidate = useMemo(() => [["issue", id], ["issues"], ["stats"]], [id]);

  const [statusTarget, setStatusTarget] = useState<IssueStatus | null>(null);
  const [resolution, setResolution] = useState("");
  const updateStatus = useAction(
    (vars: { status: IssueStatus; resolution?: string }) => issues.updateStatus(id, vars),
    {
      success: (_, vars) => `Report marked ${STATUS_LABEL[vars.status].toLowerCase()}. The customer has been notified.`,
      invalidate,
      onSuccess: () => {
        setStatusTarget(null);
        setResolution("");
      },
    },
  );

  const [assignee, setAssignee] = useState<string>("");
  // Who the report should move to, waiting for the admin to confirm.
  const [assignTarget, setAssignTarget] = useState<{ adminId: string | null; label: string } | null>(null);
  const assign = useAction((adminId: string | null) => issues.assign(id, adminId), {
    success: (_, adminId) => (adminId ? "Report assigned." : "Report unassigned."),
    invalidate,
    onSuccess: () => setAssignTarget(null),
  });

  const [priorityTarget, setPriorityTarget] = useState<IssuePriority | null>(null);
  const priority = useAction((next: IssuePriority) => issues.updatePriority(id, next), {
    success: "Priority updated.",
    invalidate,
    onSuccess: () => setPriorityTarget(null),
  });

  const [note, setNote] = useState("");
  const addNote = useAction((text: string) => issues.addNote(id, text), {
    success: "Note added.",
    invalidate: [["issue", id]],
    onSuccess: () => setNote(""),
  });

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (error || !issue)
    return <ErrorState message={error ? errorMessage(error) : "Report not found"} onRetry={() => void refetch()} />;

  const terminal = issue.status === "RESOLVED" || issue.status === "CLOSED";
  const needsResolution = statusTarget === "RESOLVED" || statusTarget === "CLOSED";
  const mine = issue.assignedTo && me.data?._id === issue.assignedTo;
  const notes = [...(issue.notes ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href="/support" className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={12} /> Support
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{issue.reference}</span>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            {isOverdue(issue) ? <Badge tone="danger">Overdue</Badge> : null}
          </span>
        }
        description={`${CATEGORY_LABEL[issue.category] ?? issue.category} · reported ${when(issue.createdAt)}`}
        actions={
          <>
            {!issue.assignedTo && !terminal ? (
              <Button
                variant="outline"
                icon={UserCheck}
                onClick={() => setAssignTarget({ adminId: me.data?._id ?? null, label: "you" })}
                loading={assign.isPending}
                disabled={!me.data?._id}
              >
                Pick up
              </Button>
            ) : null}
            {NEXT[issue.status].includes("IN_REVIEW") && issue.status !== "IN_REVIEW" ? (
              <Button variant="outline" icon={RotateCcw} onClick={() => setStatusTarget("IN_REVIEW")}>
                {issue.status === "RESOLVED" ? "Reopen" : "Start review"}
              </Button>
            ) : null}
            {NEXT[issue.status].includes("OPEN") ? (
              <Button variant="outline" icon={RotateCcw} onClick={() => setStatusTarget("OPEN")}>
                Back to open
              </Button>
            ) : null}
            {NEXT[issue.status].includes("RESOLVED") ? (
              <Button icon={CheckCircle2} onClick={() => setStatusTarget("RESOLVED")}>
                Resolve
              </Button>
            ) : null}
            {NEXT[issue.status].includes("CLOSED") ? (
              <Button variant="danger" icon={XCircle} onClick={() => setStatusTarget("CLOSED")}>
                Close
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel>
            <PanelHeader title="What the customer reported" />
            <div className="px-6 pb-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{issue.description}</p>
              {issue.attachments?.length ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {issue.attachments.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface"
                    >
                      {/\.(mp4|mov|webm)(\?|$)/i.test(url) || url.includes("/video/") ? (
                        <video src={url} className="h-full w-full object-cover" muted />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                        <ExternalLink size={16} />
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </Panel>

          {issue.resolution ? (
            <Panel>
              <PanelHeader
                title="Resolution"
                subtitle={issue.resolvedAt ? `Sent to the customer ${when(issue.resolvedAt)}` : "Shown to the customer"}
              />
              <div className="px-6 pb-5">
                <p className="whitespace-pre-wrap text-sm text-ink">{issue.resolution}</p>
              </div>
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader title="Internal notes" subtitle="Only staff see these." />
            <div className="space-y-4 px-6 pb-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={2}
                    placeholder="Called the rider, no answer. Trying again at 4pm…"
                    maxLength={2000}
                  />
                </div>
                <Button
                  icon={MessageSquarePlus}
                  onClick={() => note.trim() && addNote.mutate(note.trim())}
                  disabled={!note.trim()}
                  loading={addNote.isPending}
                >
                  Add note
                </Button>
              </div>
              {notes.length ? (
                <ul className="space-y-3">
                  {notes.map((entry, index) => (
                    <li key={entry._id ?? index} className="flex gap-3">
                      <Avatar
                        src={typeof entry.adminId === "object" ? entry.adminId.photo : undefined}
                        name={personName(entry.adminId)}
                        size={28}
                      />
                      <div className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-ink-muted">
                          <span className="font-semibold text-ink">{personName(entry.adminId)}</span>
                          <span>{when(entry.createdAt)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{entry.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-ink-faint">No notes yet.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <PanelHeader title="Customer" />
            <div className="px-6 pb-5">
              <Link href={`/customers/${issue.userId}`} className="block hover:underline">
                <PersonCell person={issue.user} />
              </Link>
              <div className="mt-3">
                <LinkButton href={`/customers/${issue.userId}`} variant="outline" size="sm">
                  Open profile
                </LinkButton>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="About" />
            <div className="px-6 pb-5">
              {issue.subjectType === "ORDER" && issue.order ? (
                <KeyValue
                  columns={1}
                  items={[
                    {
                      label: "Order",
                      value: (
                        <Link href={`/orders/${issue.order._id}`} className="font-mono text-brand-dark hover:underline">
                          {issue.order.orderNumber ?? issue.order._id}
                        </Link>
                      ),
                    },
                    { label: "Order status", value: <Badge tone="neutral">{issue.order.status}</Badge> },
                    { label: "Amount", value: naira(issue.order.totalAmountPayable) },
                    { label: "Placed", value: when(issue.order.createdAt) },
                  ]}
                />
              ) : issue.subjectType === "TRANSACTION" && issue.transaction ? (
                <KeyValue
                  columns={1}
                  items={[
                    {
                      label: "Transaction",
                      value: (
                        <Link
                          href={`/finances?tab=transactions&search=${issue.transaction.reference ?? ""}`}
                          className="font-mono text-brand-dark hover:underline"
                        >
                          {issue.transaction.reference ?? issue.transaction._id}
                        </Link>
                      ),
                    },
                    { label: "Amount", value: naira(issue.transaction.amount) },
                    { label: "Purpose", value: issue.transaction.purpose },
                    { label: "Status", value: <Badge tone="neutral">{issue.transaction.status}</Badge> },
                  ]}
                />
              ) : (
                <p className="text-sm text-ink-muted">General report, not tied to an order or transaction.</p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Handling" />
            <div className="space-y-4 px-6 pb-5">
              <Field label="Assigned to" hint={mine ? "That's you." : undefined}>
                <Select
                  value={assignee || issue.assignedTo || ""}
                  disabled={issue.status === "CLOSED" || assign.isPending}
                  onChange={(event) => {
                    const next = event.target.value;
                    const member = (staff.data?.items ?? []).find((m) => m._id === next);
                    setAssignee(next);
                    setAssignTarget({
                      adminId: next || null,
                      label: !next ? "nobody" : member?._id === me.data?._id ? "you" : fullName(member) || member?.email || "this admin",
                    });
                  }}
                >
                  <option value="">Unassigned</option>
                  {(staff.data?.items ?? []).map((member) => (
                    <option key={member._id} value={member._id}>
                      {fullName(member) || member.email}
                      {member._id === me.data?._id ? " (me)" : ""}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority">
                <Select
                  value={issue.priority}
                  disabled={terminal || priority.isPending}
                  onChange={(event) => setPriorityTarget(event.target.value as IssuePriority)}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <KeyValue
                columns={1}
                items={[
                  { label: "Reported", value: when(issue.createdAt) },
                  {
                    label: "First response",
                    value: issue.firstResponseAt ? (
                      when(issue.firstResponseAt)
                    ) : (
                      <span className="text-warning">Not yet</span>
                    ),
                  },
                  { label: "Resolved", value: issue.resolvedAt ? when(issue.resolvedAt) : undefined },
                  { label: "Last update", value: when(issue.updatedAt) },
                ]}
              />
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={assignTarget !== null}
        onClose={() => {
          setAssignTarget(null);
          setAssignee("");
        }}
        onConfirm={() => assignTarget && assign.mutate(assignTarget.adminId)}
        title={assignTarget?.adminId ? `Assign this report to ${assignTarget.label}?` : "Leave this report unassigned?"}
        description={
          assignTarget?.adminId
            ? issue.status === "OPEN"
              ? "It moves to In review and the customer is told somebody is looking at it."
              : "Only the assignee changes; the customer is not notified."
            : "It goes back into the unassigned queue for someone else to pick up."
        }
        confirmLabel={assignTarget?.adminId ? "Assign" : "Unassign"}
        tone={assignTarget?.adminId ? "primary" : "warning"}
        loading={assign.isPending}
      />
      <ConfirmDialog
        open={priorityTarget !== null && priorityTarget !== issue.priority}
        onClose={() => setPriorityTarget(null)}
        onConfirm={() => priorityTarget && priority.mutate(priorityTarget)}
        title={priorityTarget ? `Set priority to ${PRIORITY_LABEL[priorityTarget].toLowerCase()}?` : ""}
        description="Priority decides where this report sits in the queue. The customer is not notified."
        confirmLabel="Change priority"
        tone={priorityTarget === "HIGH" ? "warning" : "primary"}
        loading={priority.isPending}
      />
      <ConfirmDialog
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        onConfirm={() =>
          statusTarget &&
          (!needsResolution || resolution.trim()) &&
          updateStatus.mutate({ status: statusTarget, resolution: resolution.trim() || undefined })
        }
        title={statusTarget ? `Mark as ${STATUS_LABEL[statusTarget].toLowerCase()}` : ""}
        description={
          needsResolution
            ? "The customer gets a push notification with this note, and it stays on their report in the app."
            : "The customer is notified that their report is being looked at."
        }
        confirmLabel={statusTarget ? STATUS_LABEL[statusTarget] : "Confirm"}
        tone={statusTarget === "CLOSED" ? "danger" : "primary"}
        loading={updateStatus.isPending}
      >
        {needsResolution ? (
          <Field label="Resolution note (shown to the customer)" hint={`${resolution.length}/2000`}>
            <Textarea
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="We refunded ₦500 to your wallet and spoke to the rider."
              autoFocus
            />
          </Field>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

export default function IssuePage() {
  const params = useParams<{ id: string }>();
  return <IssueDetail id={params.id} />;
}
