"use client";

import { ChevronRight, MailSearch, Search, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge, Button, Chip, EmptyState, ErrorState, Input, PageHeader, Panel, ScrollRow, Skeleton, cx } from "@/components/kit";
import type { EmailTemplate } from "@/lib/admin/api";
import { controlFor, type ControlLike } from "@/lib/admin/email-controls";
import { EMAIL_AUDIENCE_LABEL, EMAIL_AUDIENCE_ORDER, audienceCounts, groupTemplates, templateTitle } from "@/lib/admin/emails";
import { useEmailControls, useEmailTemplates } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";
import { useCan } from "@/lib/admin/use-can";

import { KindChip, StatusLine, TemplateSwitch } from "./email-controls-ui";
import { EmailPausesPanel } from "./email-pauses";
import { CHANNEL_CHIP, EmailPreviewPanel } from "./email-preview";
import { TestSendDrawer } from "./test-send-drawer";

/**
 * Emails: every email the platform sends, grouped by what it is about, with a live preview
 * rendered by the core from the code this build ships. Staff who can change settings can send
 * themselves a test of one email, or all of them. The open template (`?key=`), the audience and
 * the search live in the URL so a link opens the same view.
 */
export function EmailsHub() {
  const table = useTableState();
  const { can, ready } = useCan();
  const canSend = can("email.testSend");
  // Writes are the owner's alone; wait for the roles so the switches never flash on for others.
  const canManage = ready && can("email.controls");
  const templates = useEmailTemplates();
  const controls = useEmailControls();
  const selectedKey = table.state.filters.key ?? "";
  const audience = table.state.filters.audience ?? "";
  const [search, setSearch] = useState(table.state.search ?? "");
  const [sending, setSending] = useState<"one" | "all" | null>(null);

  // The search box filters instantly; the URL catches up once typing pauses.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (search === (table.state.search ?? "")) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => table.update({ search: search.trim() || undefined }, { resetPage: false }), 300);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const all = useMemo(() => templates.data ?? [], [templates.data]);
  const groups = useMemo(() => groupTemplates(all, { search, audience }), [all, search, audience]);
  const counts = useMemo(() => audienceCounts(all), [all]);
  const selected = all.find((template) => template.key === selectedKey) ?? null;
  const controlOf = (template: EmailTemplate) => controlFor(template, controls.data?.templates);
  const shown = groups.reduce((sum, group) => sum + group.templates.length, 0);

  const select = (key?: string) => table.update({ key }, { resetPage: false });

  return (
    <div>
      <PageHeader
        title="Emails"
        description="Every email Pickriders sends, rendered live from the current templates with sample data, and whether each one is sending right now."
        actions={
          canSend ? (
            <Button icon={Send} variant="outline" onClick={() => setSending(selected ? "one" : "all")} disabled={!all.length}>
              Send test emails
            </Button>
          ) : null
        }
      />

      <EmailPausesPanel canManage={canManage} />

      <div className="lg:grid lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-5">
        {/* Gallery: hidden on phones while a template is open, so the preview gets the screen. */}
        <div className={cx(selected && "hidden lg:block")}>
          <Panel className="overflow-hidden lg:sticky lg:top-4">
            <div className="space-y-3 border-b border-line p-4">
              <Input
                left={<Search size={15} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search emails"
                aria-label="Search emails"
              />
              <ScrollRow peekKey="email-audiences">
                <div className="flex w-max gap-1.5">
                  <Chip active={!audience} onClick={() => table.update({ audience: undefined }, { resetPage: false })}>
                    All {all.length ? <span className="opacity-70">{all.length}</span> : null}
                  </Chip>
                  {EMAIL_AUDIENCE_ORDER.filter((value) => counts[value]).map((value) => (
                    <Chip key={value} active={audience === value} onClick={() => table.update({ audience: audience === value ? undefined : value }, { resetPage: false })}>
                      {EMAIL_AUDIENCE_LABEL[value]} <span className="opacity-70">{counts[value]}</span>
                    </Chip>
                  ))}
                </div>
              </ScrollRow>
            </div>
            <div className="admin-scroll lg:max-h-[calc(100dvh-15rem)] lg:overflow-y-auto">
              {templates.isError ? (
                <div className="p-4">
                  <ErrorState message={errorMessage(templates.error)} onRetry={() => void templates.refetch()} />
                </div>
              ) : templates.isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : !shown ? (
                <EmptyState
                  compact
                  icon={MailSearch}
                  title="No emails match"
                  description="Try another word, or show every audience."
                  action={
                    <Button size="sm" variant="outline" icon={X} onClick={() => { setSearch(""); table.update({ search: undefined, audience: undefined }, { resetPage: false }); }}>
                      Clear search
                    </Button>
                  }
                />
              ) : (
                groups.map((group) => (
                  <section key={group.category} className="border-b border-line last:border-0">
                    <p className="sticky top-0 z-[1] bg-card/95 px-4 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint backdrop-blur">
                      {group.label} <span className="font-semibold">{group.templates.length}</span>
                    </p>
                    <ul className="px-2 pb-2">
                      {group.templates.map((template) => (
                        <li key={template.key}>
                          <TemplateRow
                            template={template}
                            control={controlOf(template)}
                            canManage={canManage}
                            active={template.key === selectedKey}
                            onSelect={() => select(template.key)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </Panel>
        </div>

        <div className={cx(!selected && !(selectedKey && templates.isLoading) && "hidden lg:block", "min-w-0")}>
          {selected ? (
            <EmailPreviewPanel
              key={selected.key}
              template={selected}
              control={controlOf(selected)}
              canManage={canManage}
              onBack={() => select(undefined)}
              onSendTest={canSend ? () => setSending("one") : undefined}
            />
          ) : selectedKey && templates.isLoading ? (
            <Panel className="space-y-3 p-5">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-[60vh] w-full" />
            </Panel>
          ) : (
            <Panel>
              <EmptyState
                icon={MailSearch}
                title={selectedKey && templates.data ? "That email is not in the registry" : "Pick an email to preview it"}
                description="The preview is rendered by the core from the templates it ships, with sample data. Switch between desktop and mobile widths, light and dark, or the plain-text part."
              />
            </Panel>
          )}
        </div>
      </div>

      {canSend ? (
        <TestSendDrawer
          open={sending !== null}
          initialScope={sending ?? "all"}
          template={selected}
          totalTemplates={all.length}
          onClose={() => setSending(null)}
        />
      ) : null}
    </div>
  );
}

function TemplateRow({
  template,
  control,
  canManage,
  active,
  onSelect,
}: {
  template: EmailTemplate;
  control: ControlLike;
  canManage: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  // The switch sits beside the row's button, not inside it: a switch cannot nest in a button.
  return (
    <div className={cx("group flex w-full items-start gap-2 rounded-xl px-2.5 py-2.5 transition-colors", active ? "bg-ink text-card" : "hover:bg-surface")}>
      <button type="button" onClick={onSelect} aria-current={active ? "true" : undefined} className="flex min-w-0 flex-1 items-start gap-2 text-left">
        <span className="min-w-0 flex-1">
          <span className={cx("block truncate text-sm font-bold", active ? "text-card" : "text-ink")}>{templateTitle(template.key)}</span>
          <span className={cx("mt-0.5 line-clamp-2 block text-xs", active ? "text-card/75" : "text-ink-muted")}>{template.description}</span>
          <StatusLine control={control} onDark={active} className="mt-1" />
          <span className="mt-1.5 flex flex-wrap items-center gap-1">
            <KindChip control={control} onDark={active} />
            <Badge tone={active ? "neutral" : "brand"} className={active ? "border-transparent bg-card/15 text-card" : undefined}>
              {EMAIL_AUDIENCE_LABEL[template.audience] ?? template.audience}
            </Badge>
            {template.channels.map((channel) => (
              <Badge key={channel} tone={active ? "neutral" : CHANNEL_CHIP[channel]?.tone ?? "neutral"} className={active ? "border-transparent bg-card/15 text-card" : undefined}>
                {CHANNEL_CHIP[channel]?.label ?? channel}
              </Badge>
            ))}
          </span>
        </span>
        {canManage ? null : <ChevronRight size={16} className={cx("mt-0.5 shrink-0", active ? "text-card" : "text-ink-faint group-hover:text-ink")} aria-hidden />}
      </button>
      {canManage ? (
        <span className="shrink-0 pt-0.5">
          <TemplateSwitch control={control} canManage={canManage} />
        </span>
      ) : null}
    </div>
  );
}
