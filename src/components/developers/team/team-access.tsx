"use client";

import { Crown, KeyRound, Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { Badge, Button, EmptyState, Panel } from "@/components/kit";
import { CopyButton } from "@/components/users/person-card";
import type { DeveloperDetail, DeveloperKey } from "@/lib/admin/api";
import { ago, day, when } from "@/lib/admin/format";
import { useCan } from "@/lib/admin/use-can";

import { RevokeKeyDialog } from "../developer-actions";
import { KeyStatusBadge, ModeBadge } from "../developer-ui";
import { Verified } from "./team-header";
import { CardTitle, type Mode } from "./team-shared";

/** Working keys first (newest first), then revoked and expired ones. */
export function sortKeys(keys: DeveloperKey[]): { working: DeveloperKey[]; old: DeveloperKey[] } {
  const usable = (k: DeveloperKey) => k.status === "active" || k.status === "expiring";
  return { working: keys.filter(usable), old: keys.filter((k) => !usable(k)) };
}

/** "TEAM_DEVELOPER" → "Developer". */
export const roleLabel = (role: string) =>
  role
    .replace(/^TEAM_/, "")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

function KeyRow({ apiKey, canRevoke, onRevoke }: { apiKey: DeveloperKey; canRevoke: boolean; onRevoke: () => void }) {
  const usable = apiKey.status === "active" || apiKey.status === "expiring";
  return (
    <li className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-start">
      <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted sm:grid">
        <KeyRound size={15} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{apiKey.label || "Unnamed key"}</span>
          <ModeBadge livemode={apiKey.livemode} />
          <KeyStatusBadge status={apiKey.status} />
        </p>
        <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink-muted">
          {apiKey.prefix}…
          <CopyButton text={apiKey.prefix} label="Copy key prefix" />
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          Created {day(apiKey.createdAt)} · {apiKey.lastUsedAt ? `used ${ago(apiKey.lastUsedAt)}` : "never used"}
          {apiKey.expiresAt
            ? ` · ${apiKey.status === "expired" ? "expired" : "expires"} ${when(apiKey.expiresAt)}`
            : ""}
        </p>
        {apiKey.revokedAt ? (
          <p className="mt-1.5 rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs text-danger">
            Revoked {when(apiKey.revokedAt)}
            {apiKey.revokedReason ? `: “${apiKey.revokedReason}”` : ""}
          </p>
        ) : null}
        <p className="mt-1.5 flex flex-wrap gap-1">
          {apiKey.scopes.length ? (
            apiKey.scopes.map((scope) => (
              <span key={scope} className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
                {scope}
              </span>
            ))
          ) : (
            <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
              Full access
            </span>
          )}
        </p>
      </div>
      {usable && canRevoke ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRevoke}
          className="shrink-0 self-start text-danger hover:bg-danger-soft hover:text-danger"
        >
          Revoke
        </Button>
      ) : null}
    </li>
  );
}

/** Keys in the page's mode (prefixes only: Pickriders never stores a secret it can show), and where they may be used from. */
export function TeamKeys({ team, mode }: { team: DeveloperDetail; mode: Mode }) {
  const { can } = useCan();
  const [revoking, setRevoking] = useState<DeveloperKey | null>(null);
  const [showOld, setShowOld] = useState(false);
  const inMode = team.keys.filter((k) => k.livemode === (mode === "live"));
  const { working, old } = sortKeys(inMode);
  const shown = showOld ? [...working, ...old] : working;
  const ips = team.settings.allowedIps;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-2">
        <CardTitle
          title={`${mode === "live" ? "Live" : "Test"} keys`}
          icon={KeyRound}
          hint={`${working.length} working${old.length ? `, ${old.length} revoked or expired` : ""}. Revoking stops a key on its next request.`}
          action={
            old.length ? (
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="text-xs font-semibold text-ink-muted hover:text-ink"
              >
                {showOld ? "Hide old keys" : "Show old keys"}
              </button>
            ) : undefined
          }
        />
        {shown.length ? (
          <ul className="mt-3 divide-y divide-line border-t border-line">
            {shown.map((k) => (
              <KeyRow key={k.id} apiKey={k} canRevoke={can("developer.manage")} onRevoke={() => setRevoking(k)} />
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            icon={KeyRound}
            title={`No working ${mode} keys`}
            description="They create keys in the developer dashboard."
          />
        )}
      </Panel>

      <Panel className="self-start">
        <CardTitle
          title="IP allowlist"
          icon={ShieldCheck}
          hint="Keys are refused from any other address. Applies to every key."
        />
        <div className="px-5 pb-5 pt-4">
          {ips.length ? (
            <ul className="space-y-1.5">
              {ips.map((ip) => (
                <li key={ip} className="rounded-lg bg-surface px-3 py-1.5 font-mono text-[13px] text-ink">
                  {ip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Off: keys work from any IP.</p>
          )}
        </div>
      </Panel>
      <RevokeKeyDialog teamId={team.id} apiKey={revoking} onClose={() => setRevoking(null)} />
    </div>
  );
}

/** Who is on the team, who has been invited, and where operational emails go. */
export function TeamMembers({ team }: { team: DeveloperDetail }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-2">
        <CardTitle title="Members" icon={Users} hint="Active members, owner first, with their own verification." />
        <ul className="mt-3 divide-y divide-line border-t border-line">
          {team.members.map((member) => (
            <li
              key={member.id}
              className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="truncate">{member.name || member.email}</span>
                  {member.isOwner ? (
                    <Badge tone="brand">
                      <Crown size={10} aria-hidden /> Owner
                    </Badge>
                  ) : null}
                </p>
                <p className="flex items-center gap-1 truncate text-xs text-ink-muted">
                  {member.email}
                  <CopyButton text={member.email} label="Copy email" />
                </p>
                <p className="mt-1 flex flex-wrap gap-3">
                  <Verified ok={member.emailVerified} label="Email" />
                  <Verified ok={member.phoneVerified} label="Phone" />
                </p>
              </div>
              <Badge tone="neutral" className="self-start sm:self-center">
                {roleLabel(member.role)}
              </Badge>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <CardTitle title="Invitations" icon={UserPlus} hint="Sent, not yet accepted. Each link lasts 7 days." />
          <div className="px-5 pb-5 pt-4">
            {team.invitations.length ? (
              <ul className="space-y-3">
                {team.invitations.map((invite) => (
                  <li key={invite.id} className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="truncate">{invite.email}</span>
                      {invite.expired ? <Badge tone="neutral">Expired</Badge> : <Badge tone="warning">Waiting</Badge>}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {roleLabel(invite.role)} · invited by {invite.invitedBy || "a member"} {ago(invite.createdAt)}
                      {invite.sendCount > 1 ? ` · sent ${invite.sendCount} times` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No open invitations.</p>
            )}
          </div>
        </Panel>
        <Panel>
          <CardTitle
            title="Operational emails"
            icon={Mail}
            hint="Low balance, failed top-ups and failing webhooks go to owners, finance members and these."
          />
          <div className="px-5 pb-5 pt-4">
            {team.settings.notificationEmails.length ? (
              <ul className="space-y-1">
                {team.settings.notificationEmails.map((email) => (
                  <li key={email} className="truncate text-sm text-ink">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No extra addresses.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
