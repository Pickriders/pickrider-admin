"use client";

import { ExternalLink, Megaphone, Plus, Siren } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Panel,
  PanelHeader,
  Skeleton,
  Textarea,
  cx,
  type Tone,
} from "@/components/kit";
import { developers, type DeveloperIncident } from "@/lib/admin/api";
import { when } from "@/lib/admin/format";
import { useAction, useDeveloperIncidents } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";

/** Labels and the rules for incidents on the public status page. Pure parts are exported for the test. */

type Impact = DeveloperIncident["impact"];
type Status = DeveloperIncident["status"];
type Component = DeveloperIncident["components"][number];

export const IMPACTS: { id: Impact; label: string; hint: string; tone: Tone }[] = [
  { id: "minor", label: "Minor", hint: "Slower or flaky, but working", tone: "warning" },
  { id: "major", label: "Major", hint: "Failing for some, or some routes", tone: "danger" },
  { id: "critical", label: "Critical", hint: "Down for everyone", tone: "danger" },
];
export const COMPONENTS: { id: Component; label: string }[] = [
  { id: "api", label: "API" },
  { id: "webhooks", label: "Webhooks" },
  { id: "dashboard", label: "Dashboard" },
];
export const STATUSES: { id: Status; label: string; hint: string }[] = [
  { id: "investigating", label: "Investigating", hint: "We know, and we're looking" },
  { id: "identified", label: "Identified", hint: "We know the cause" },
  { id: "monitoring", label: "Monitoring", hint: "A fix is out; watching" },
  { id: "resolved", label: "Resolved", hint: "Fixed. Closes the incident" },
];
const label = <T extends { id: string; label: string }>(list: T[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id;

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
/** Why an incident can't be posted yet, or null. Mirrors the API's checks. */
export function incidentProblem(draft: { title?: string; components?: Component[]; message: string }): string | null {
  if (draft.title !== undefined && draft.title.trim().length < 5) return "Give it a title of at least 5 characters.";
  if (draft.components !== undefined && draft.components.length === 0) return "Pick at least one affected part.";
  if (draft.message.trim().length < MESSAGE_MIN) return `Write at least ${MESSAGE_MIN} characters for developers.`;
  if (draft.message.trim().length > MESSAGE_MAX) return `At most ${MESSAGE_MAX} characters.`;
  return null;
}

const INVALIDATE = [["developers", "incidents"]];
const STATUS_PAGE = (process.env.NEXT_PUBLIC_DEVELOPER_DASHBOARD_URL ?? "").replace(/\/$/, "");

function Choice<T extends string>({
  value,
  onChange,
  options,
  label: name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; hint?: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cx(
            "rounded-xl border px-3 py-2 text-left transition-colors",
            value === o.id ? "border-brand bg-brand-soft" : "border-line hover:bg-surface",
          )}
        >
          <span className="block text-sm font-semibold text-ink">{o.label}</span>
          {o.hint ? <span className="block text-xs text-ink-muted">{o.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}

function OpenIncidentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [impact, setImpact] = useState<Impact>("minor");
  const [components, setComponents] = useState<Component[]>(["api"]);
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const reset = () => {
    setTitle("");
    setImpact("minor");
    setComponents(["api"]);
    setMessage("");
    setTouched(false);
  };
  const run = useAction(
    () => developers.openIncident({ title: title.trim(), impact, components, message: message.trim() }),
    {
      success: "Incident posted. It's on the status page now.",
      invalidate: INVALIDATE,
      onSuccess: () => {
        reset();
        onClose();
      },
    },
  );
  const problem = incidentProblem({ title, components, message });
  return (
    <ConfirmDialog
      open={open}
      onClose={() => (run.isPending ? undefined : (reset(), onClose()))}
      onConfirm={() => {
        setTouched(true);
        if (!problem) run.mutate(undefined);
      }}
      title="Open an incident"
      description="It shows on the public status page as soon as you post it."
      confirmLabel="Post incident"
      tone="danger"
      icon={Siren}
      loading={run.isPending}
      disabled={touched && Boolean(problem)}
    >
      <div className="space-y-4 text-left">
        <Field
          label="Title"
          hint="What developers notice, in a few words."
          error={touched && title.trim().length < 5 ? "At least 5 characters." : undefined}
        >
          <Input
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Slow order creation"
          />
        </Field>
        <Field label="Affected">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Affected">
            {COMPONENTS.map((c) => {
              const on = components.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setComponents((list) => (on ? list.filter((x) => x !== c.id) : [...list, c.id]))}
                  className={cx(
                    "h-9 rounded-xl border px-3 text-sm font-semibold",
                    on ? "border-brand bg-brand-soft text-brand-dark" : "border-line text-ink-muted hover:bg-surface",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Impact">
          <Choice value={impact} onChange={setImpact} options={IMPACTS} label="Impact" />
        </Field>
        <Field
          label="First update"
          hint="What people see and what they should do. Public."
          error={touched && problem && problem.startsWith("Write") ? problem : undefined}
        >
          <Textarea
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Creating orders is slow. Retry with the same Idempotency-Key; nothing is charged twice."
            className="min-h-24"
          />
        </Field>
      </div>
    </ConfirmDialog>
  );
}

function UpdateDialog({ incident, onClose }: { incident: DeveloperIncident | null; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("identified");
  const [impact, setImpact] = useState<Impact | null>(null);
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const reset = () => {
    setStatus("identified");
    setImpact(null);
    setMessage("");
    setTouched(false);
  };
  const run = useAction(
    (id: string) =>
      developers.updateIncident(id, {
        status,
        message: message.trim(),
        ...(impact && impact !== incident?.impact && { impact }),
      }),
    {
      success: () => (status === "resolved" ? "Resolved. The status page shows it's fixed." : "Update posted."),
      invalidate: INVALIDATE,
      onSuccess: () => {
        reset();
        onClose();
      },
    },
  );
  const problem = incidentProblem({ message });
  return (
    <ConfirmDialog
      open={Boolean(incident)}
      onClose={() => (run.isPending ? undefined : (reset(), onClose()))}
      onConfirm={() => {
        setTouched(true);
        if (incident && !problem) run.mutate(incident.record_id);
      }}
      title={incident ? `Update: ${incident.title}` : ""}
      description="Posted publicly on the status page. Update at least every 30 minutes while it's open."
      confirmLabel={status === "resolved" ? "Resolve incident" : "Post update"}
      tone={status === "resolved" ? "primary" : "warning"}
      icon={Megaphone}
      loading={run.isPending}
      disabled={touched && Boolean(problem)}
    >
      <div className="space-y-4 text-left">
        <Field label="Status">
          <Choice value={status} onChange={setStatus} options={STATUSES} label="Status" />
        </Field>
        {status !== "resolved" && incident ? (
          <Field
            label="Impact"
            hint={`Now ${label(IMPACTS, incident.impact).toLowerCase()}. Change it if it got better or worse.`}
          >
            <Choice value={impact ?? incident.impact} onChange={setImpact} options={IMPACTS} label="Impact" />
          </Field>
        ) : null}
        <Field label="Message" error={touched && problem ? problem : undefined}>
          <Textarea
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24"
          />
        </Field>
      </div>
    </ConfirmDialog>
  );
}

function IncidentRow({ incident, onUpdate }: { incident: DeveloperIncident; onUpdate?: () => void }) {
  const impact = IMPACTS.find((i) => i.id === incident.impact)!;
  return (
    <li className="px-6 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{incident.title}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {incident.components.map((c) => label(COMPONENTS, c)).join(", ")} · started {when(incident.started_at)}
            {incident.resolved_at ? ` · resolved ${when(incident.resolved_at)}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={incident.status === "resolved" ? "success" : impact.tone} dot>
              {label(STATUSES, incident.status)}
            </Badge>
            <Badge tone="neutral">{impact.label}</Badge>
          </div>
        </div>
        {onUpdate ? (
          <Button size="sm" variant="outline" onClick={onUpdate} className="shrink-0 self-start">
            <Megaphone size={14} aria-hidden /> Post update
          </Button>
        ) : null}
      </div>
      <ol className="mt-3 space-y-2 border-l-2 border-line pl-3">
        {incident.updates.slice(0, onUpdate ? 3 : 1).map((u, i) => (
          <li key={i} className="text-sm text-ink">
            <span className="font-semibold">{label(STATUSES, u.status)}.</span> {u.message}
            <span className="ml-1.5 text-xs text-ink-faint">{when(u.at)}</span>
          </li>
        ))}
      </ol>
    </li>
  );
}

/** Incidents on the developer platform's public status page: open, update and resolve them. */
export function DeveloperIncidentsPanel() {
  const list = useDeveloperIncidents();
  const { can } = useCan();
  const manage = can("incident.manage");
  const [opening, setOpening] = useState(false);
  const [updating, setUpdating] = useState<DeveloperIncident | null>(null);
  const rows = list.data?.data ?? [];
  const open = rows.filter((i) => !i.resolved_at);
  const resolved = rows.filter((i) => i.resolved_at);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Developers see these on the public status page.{" "}
          {STATUS_PAGE ? (
            <a
              href={`${STATUS_PAGE}/status`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline"
            >
              Open the status page <ExternalLink size={12} aria-hidden />
            </a>
          ) : null}
        </p>
        {manage ? (
          <Button onClick={() => setOpening(true)}>
            <Plus size={16} aria-hidden /> Open incident
          </Button>
        ) : null}
      </div>

      {list.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : list.isError ? (
        <ErrorState
          message={errorMessage(list.error, "Could not load incidents.")}
          onRetry={() => void list.refetch()}
        />
      ) : (
        <>
          <Panel>
            <PanelHeader title="Open" subtitle={open.length ? "Update each at least every 30 minutes." : undefined} />
            {open.length ? (
              <ul className="mt-3 divide-y divide-line">
                {open.map((incident) => (
                  <IncidentRow
                    key={incident.record_id}
                    incident={incident}
                    onUpdate={manage ? () => setUpdating(incident) : undefined}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={Siren}
                title="No open incidents"
                description="The status page shows all systems operational, unless monitoring sees a problem."
              />
            )}
          </Panel>
          {resolved.length ? (
            <Panel>
              <PanelHeader title="Resolved" subtitle="The latest 50. They stay in the status page's 90-day history." />
              <ul className="mt-3 divide-y divide-line">
                {resolved.map((incident) => (
                  <IncidentRow key={incident.record_id} incident={incident} />
                ))}
              </ul>
            </Panel>
          ) : null}
        </>
      )}
      <OpenIncidentDialog open={opening} onClose={() => setOpening(false)} />
      <UpdateDialog incident={updating} onClose={() => setUpdating(null)} />
    </div>
  );
}
