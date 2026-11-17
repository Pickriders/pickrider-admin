"use client";

import { ArrowLeft, Braces, Info, Lock, Monitor, Moon, RotateCcw, Send, Smartphone, Sun, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Badge, Button, ErrorState, Panel, Skeleton, Tabs, Textarea, cx, type Tone } from "@/components/kit";
import type { EmailTemplate } from "@/lib/admin/api";
import { emailKind, switchLock, type ControlLike } from "@/lib/admin/email-controls";
import {
  EMAIL_AUDIENCE_LABEL,
  EMAIL_CATEGORY_LABEL,
  PREVIEW_WIDTH,
  formatSampleVariables,
  hasDarkStyles,
  missingVariables,
  parseSampleVariables,
  previewDocument,
  templateTitle,
  type PreviewDevice,
  type PreviewScheme,
} from "@/lib/admin/emails";
import { when } from "@/lib/admin/format";
import { MESSAGE_PURPOSE_LABEL } from "@/lib/admin/messages";
import { useEmailPreview } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { KindChip, StatusLine, TemplateSwitch } from "./email-controls-ui";

/** How each delivery channel reads on a chip. */
export const CHANNEL_CHIP: Record<string, { label: string; tone: Tone }> = {
  EMAIL: { label: "Email", tone: "info" },
  SMS: { label: "SMS", tone: "warning" },
  PUSH: { label: "Push", tone: "neutral" },
  IN_APP: { label: "In-app", tone: "neutral" },
};

const VIEWS = ["email", "text"] as const;
type View = (typeof VIEWS)[number];

function Segmented<T extends string>({
  value,
  onChange,
  items,
  label,
}: {
  value: T;
  onChange: (next: T) => void;
  items: { id: T; label: string; icon: typeof Sun }[];
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-line bg-surface p-0.5">
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={cx(
              "inline-flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 text-xs font-semibold transition-colors",
              active ? "bg-card text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={14} aria-hidden />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

/**
 * One template: what it is and when it goes out, then the preview the core renders (sample data,
 * or the staff member's edited data). Remounted per template, so edited data never leaks across.
 */
export function EmailPreviewPanel({
  template,
  control,
  canManage,
  onBack,
  onSendTest,
}: {
  template: EmailTemplate;
  control: ControlLike;
  canManage: boolean;
  onBack: () => void;
  onSendTest?: () => void;
}) {
  const table = useTableState();
  const view: View = table.state.filters.view === "text" ? "text" : "email";
  const device: PreviewDevice = table.state.filters.device === "mobile" ? "mobile" : "desktop";
  const scheme: PreviewScheme = table.state.filters.scheme === "dark" ? "dark" : "light";
  const set = (key: string, value: string | undefined) => table.update({ [key]: value }, { resetPage: false });

  const [custom, setCustom] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const preview = useEmailPreview(template.key, custom);
  const data = preview.data;
  const srcDoc = useMemo(() => (data?.html ? previewDocument(data.html, scheme) : ""), [data?.html, scheme]);
  const emailed = (template.channels as string[]).includes("EMAIL");

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink lg:hidden"
            >
              <ArrowLeft size={14} aria-hidden />
              All emails
            </button>
            <h2 className="text-lg font-black tracking-tight text-ink">{templateTitle(template.key)}</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{template.description}</p>
          </div>
          {onSendTest ? (
            <Button icon={Send} size="sm" onClick={onSendTest} className="shrink-0 self-start">
              Send test
            </Button>
          ) : null}
        </div>
        <ControlState control={control} canManage={canManage} />
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <KindChip control={control} />
          <Badge tone="brand">{EMAIL_AUDIENCE_LABEL[template.audience] ?? template.audience}</Badge>
          <Badge>{EMAIL_CATEGORY_LABEL[template.category] ?? template.category}</Badge>
          <Badge tone={template.purpose === "SECURITY" ? "warning" : "neutral"}>
            {MESSAGE_PURPOSE_LABEL[template.purpose] ?? template.purpose}
          </Badge>
          {template.respectsEmailPreference ? <Badge tone="info">Skipped when email is turned off</Badge> : null}
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Meta label="Sent when">{template.trigger}</Meta>
          <Meta label="Goes out as">
            <span className="flex flex-wrap gap-1">
              {template.channels.map((channel) => (
                <Badge key={channel} tone={CHANNEL_CHIP[channel]?.tone ?? "neutral"}>
                  {CHANNEL_CHIP[channel]?.label ?? channel}
                </Badge>
              ))}
            </span>
          </Meta>
          <Meta label="Template">
            <span className="font-mono text-xs text-ink-muted">{template.name}</span>
          </Meta>
          <Meta label="Variables">
            {template.variables.length ? (
              <span className="flex flex-wrap gap-1">
                {template.variables.map((name) => (
                  <code key={name} className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
                    {name}
                  </code>
                ))}
              </span>
            ) : (
              <span className="text-ink-faint">None</span>
            )}
          </Meta>
        </dl>
        {!emailed ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs text-ink-muted">
            <Info size={14} className="mt-px shrink-0" aria-hidden />
            Not emailed today: it goes out as{" "}
            {template.channels
              .map((c) => CHANNEL_CHIP[c]?.label ?? c)
              .join(" and ")
              .toLowerCase()}
            . This is the email layout it has in the registry.
          </p>
        ) : null}
      </Panel>

      <Panel className="overflow-hidden">
        {/* Inbox line: what the recipient sees before opening. */}
        <div className="border-b border-line px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Subject</p>
          {data ? (
            <p className="mt-0.5 break-words text-sm font-bold text-ink">{data.subject}</p>
          ) : preview.isError ? (
            <p className="mt-0.5 text-sm text-ink-faint">Unavailable</p>
          ) : (
            <Skeleton className="mt-1.5 h-4 w-2/3" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <Tabs<View>
            value={view}
            onChange={(next) => set("view", next === "email" ? undefined : next)}
            items={[
              { id: "email", label: "Email" },
              { id: "text", label: "Plain text" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {view === "email" ? (
              <>
                <Segmented<PreviewDevice>
                  label="Preview width"
                  value={device}
                  onChange={(next) => set("device", next === "desktop" ? undefined : next)}
                  items={[
                    { id: "desktop", label: `Desktop ${PREVIEW_WIDTH.desktop}`, icon: Monitor },
                    { id: "mobile", label: `Mobile ${PREVIEW_WIDTH.mobile}`, icon: Smartphone },
                  ]}
                />
                <Segmented<PreviewScheme>
                  label="Colour scheme"
                  value={scheme}
                  onChange={(next) => set("scheme", next === "light" ? undefined : next)}
                  items={[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                  ]}
                />
              </>
            ) : null}
            <Button
              size="sm"
              variant={editing ? "secondary" : "outline"}
              icon={Braces}
              onClick={() => setEditing((v) => !v)}
              aria-expanded={editing}
            >
              Sample data{custom ? " (edited)" : ""}
            </Button>
          </div>
        </div>

        {editing && data ? (
          <SampleDataEditor
            initial={data.variables as Record<string, unknown>}
            expected={template.variables}
            edited={Boolean(custom)}
            loading={preview.isFetching}
            onApply={setCustom}
            onReset={() => setCustom(null)}
          />
        ) : null}

        {preview.isError ? (
          <div className="p-4">
            <ErrorState
              message={errorMessage(preview.error)}
              onRetry={custom ? () => setCustom(null) : () => void preview.refetch()}
            />
            {custom ? (
              <p className="mt-2 text-center text-xs text-ink-muted">Try again resets to the sample data.</p>
            ) : null}
          </div>
        ) : view === "text" ? (
          <div className="p-4">
            {data ? (
              <pre className="admin-scroll max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink">
                {data.text || "This email has no plain-text part."}
              </pre>
            ) : (
              <Skeleton className="h-80 w-full" />
            )}
            <p className="mt-2 text-[11px] text-ink-faint">
              Sent alongside the HTML. Mail apps that cannot show HTML, and some screen readers, use this part.
            </p>
          </div>
        ) : (
          <div>
            <div
              className={cx(
                "admin-scroll overflow-x-auto px-3 py-5 transition-colors sm:px-5",
                scheme === "dark" ? "bg-[#111113]" : "bg-surface",
              )}
            >
              <div
                className={cx(
                  "mx-auto overflow-hidden rounded-xl border shadow-card",
                  scheme === "dark" ? "border-white/10" : "border-line",
                )}
                style={{ width: PREVIEW_WIDTH[device], maxWidth: device === "mobile" ? "100%" : undefined }}
              >
                {srcDoc ? (
                  <iframe
                    title={`${templateTitle(template.key)} email preview, ${scheme} mode, ${device} width`}
                    srcDoc={srcDoc}
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    referrerPolicy="no-referrer"
                    className={cx(
                      "block h-[70vh] min-h-[480px] w-full border-0 transition-opacity",
                      preview.isFetching && "opacity-60",
                    )}
                    style={{ colorScheme: scheme }}
                  />
                ) : (
                  <div className="h-[70vh] min-h-[480px] space-y-3 bg-card p-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                )}
              </div>
            </div>
            <p className="flex items-start gap-1.5 border-t border-line px-5 py-3 text-[11px] leading-relaxed text-ink-faint">
              <Info size={12} className="mt-0.5 shrink-0" aria-hidden />
              {scheme === "dark"
                ? data?.html && !hasDarkStyles(data.html)
                  ? "This template has no dark-mode styles, so mail apps show it as in light mode or invert it themselves."
                  : "Dark applies the template's own dark-mode styles, which is what Apple Mail and iOS Mail show (Outlook.com uses matching rules). Gmail's apps and Outlook for Windows recolour emails their own way, which a browser cannot reproduce: check those in Litmus or on a real device."
                : "Rendered in a sandbox with scripts off, at the width a mail app gives it. Links open in a new tab."}
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}

/**
 * The email's sending state, the same as the gallery row: status line, switch (super admin), and
 * why it is locked or who turned it off. Everything is spelled out here, so nothing relies on the
 * chip's tooltip on a phone.
 */
function ControlState({ control, canManage }: { control: ControlLike; canManage: boolean }) {
  const lock = switchLock(control, canManage);
  const essential = emailKind(control) === "essential";
  const off = control.skipReason === "DISABLED_BY_ADMIN";
  return (
    <div
      className={cx(
        "mt-3 rounded-xl border px-3 py-2.5",
        off
          ? "border-danger/30 bg-danger-soft/50"
          : control.skipReason
            ? "border-warning/40 bg-warning-soft/50"
            : "border-line bg-surface/60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusLine control={control} className="text-xs" />
        <TemplateSwitch control={control} canManage={canManage} withLabel />
      </div>
      {essential ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-muted">
          <Lock size={12} className="mt-0.5 shrink-0" aria-hidden />
          <span>Essential: {control.essentialReason || "always sends"}. It cannot be turned off or paused.</span>
        </p>
      ) : lock.locked && lock.reason && canManage ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-muted">
          <Lock size={12} className="mt-0.5 shrink-0" aria-hidden />
          <span>{lock.reason}</span>
        </p>
      ) : null}
      {off && control.disabledAt ? (
        <p className="mt-1 text-[11px] text-ink-faint">Turned off {when(control.disabledAt)}</p>
      ) : null}
    </div>
  );
}

/**
 * JSON editor for the variables. Applied only when it parses to an object; the core merges it over
 * the sample data and escapes every value, so this is safe to point at real-looking data.
 */
function SampleDataEditor({
  initial,
  expected,
  edited,
  loading,
  onApply,
  onReset,
}: {
  initial: Record<string, unknown>;
  expected: string[];
  edited: boolean;
  loading: boolean;
  onApply: (value: Record<string, unknown>) => void;
  onReset: () => void;
}) {
  const [text, setText] = useState(() => formatSampleVariables(initial));
  const [touched, setTouched] = useState(false);
  // After a reset the preview answers with the sample data again: show it.
  useEffect(() => {
    if (!edited && !touched) setText(formatSampleVariables(initial));
  }, [initial, edited, touched]);

  const parsed = parseSampleVariables(text);
  const missing = parsed.ok ? missingVariables(expected, parsed.value) : [];

  return (
    <div className="border-b border-line bg-surface/60 px-4 py-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-muted">
          Variables as JSON. Applying renders the email again with these values.
        </p>
        <span className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              setTouched(false);
              setText(formatSampleVariables(initial));
              onReset();
            }}
          >
            Reset
          </Button>
          <Button
            size="sm"
            icon={Wand2}
            loading={loading && touched}
            disabled={!parsed.ok}
            onClick={() => {
              if (!parsed.ok) return;
              setTouched(false);
              onApply(parsed.value);
            }}
          >
            Preview with this data
          </Button>
        </span>
      </div>
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setTouched(true);
        }}
        spellCheck={false}
        aria-label="Sample data JSON"
        aria-invalid={!parsed.ok}
        className={cx(
          "min-h-56 font-mono text-xs leading-relaxed",
          !parsed.ok && "border-danger focus:border-danger focus:ring-danger/25",
        )}
      />
      {!parsed.ok ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{parsed.error}</p>
      ) : missing.length ? (
        <p className="mt-1.5 text-xs text-warning">
          Not in this data, so they render empty: <span className="font-mono">{missing.join(", ")}</span>
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-faint">
          Values are escaped by the server, so HTML in a value shows as text.
        </p>
      )}
    </div>
  );
}
