"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Laptop, LogOut, MonitorSmartphone, RefreshCw, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge, Button, ConfirmDialog, Drawer, EmptyState, ErrorState, Input, KeyValue, Panel, PanelHeader, Skeleton, cx } from "@/components/kit";
import { CodeInput } from "@/components/kit/code-input";
import { CopyButton, DownloadButton } from "@/components/security/copy-button";
import { MfaSetupFlow, recoveryCodesText } from "@/components/security/mfa-setup";
import { auth, type AdminSession } from "@/lib/admin/api";
import { ago, day, when } from "@/lib/admin/format";
import { useAction, useMfaStatus, useSessions } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { clearMfaSetupDeadline } from "@/lib/admin/session";
import { settingsHref } from "@/lib/admin/settings-tabs";
import { useAuth } from "@/hooks/useAuth";

/**
 * Settings, Security tab: the signed-in admin's authenticator (set up, regenerate recovery codes, turn off)
 * and every session on the account (device, IP, last seen, revoke one, sign out everywhere else).
 */
function deviceLabel(session: AdminSession) {
  return session.userAgent || "Unknown device";
}

function deviceIcon(session: AdminSession) {
  const ua = (session.userAgent ?? "").toLowerCase();
  return /iphone|android|mobile|ipad/.test(ua) ? Smartphone : Laptop;
}

/** A code (authenticator or recovery) typed into a dialog; the same input serves "Turn off" and "Regenerate". */
function CodePrompt({ value, onChange, useRecovery, onToggle, autoFocus }: { value: string; onChange: (v: string) => void; useRecovery: boolean; onToggle: () => void; autoFocus?: boolean }) {
  return (
    <div>
      {useRecovery ? (
        <Input autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder="XXXXX-XXXXX" autoComplete="off" className="font-mono uppercase tracking-widest" aria-label="Recovery code" />
      ) : (
        <CodeInput value={value} onChange={onChange} autoFocus={autoFocus} />
      )}
      <button type="button" onClick={onToggle} className="mt-2 text-xs font-bold text-brand-dark hover:underline">
        {useRecovery ? "Use my authenticator app instead" : "Use a recovery code"}
      </button>
    </div>
  );
}

function codeReady(value: string, useRecovery: boolean) {
  return useRecovery ? value.trim().length >= 5 : value.length === 6;
}

export function AuthenticatorPanel() {
  const params = useSearchParams();
  const router = useRouter();
  const client = useQueryClient();
  const status = useMfaStatus();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  // `?setup=1` (the grace banner's "Set up now") opens the flow straight away.
  useEffect(() => {
    if (params.get("setup") === "1" && status.data && !status.data.enabled) setSetupOpen(true);
  }, [params, status.data]);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["me", "mfa"] });
    void client.invalidateQueries({ queryKey: ["me", "sessions"] });
  };
  const resetPrompt = () => {
    setCode("");
    setUseRecovery(false);
  };

  const disable = useAction((value: string) => auth.mfaDisable(value), {
    success: "Authenticator turned off",
    onSuccess: () => {
      setDisableOpen(false);
      resetPrompt();
      refresh();
    },
  });
  const regenerate = useMutation({
    mutationFn: (value: string) => auth.regenerateRecoveryCodes(value),
    onSuccess: (data) => {
      setNewCodes(data.recoveryCodes);
      resetPrompt();
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const data = status.data;
  const enabled = Boolean(data?.enabled);

  return (
    <Panel>
      <PanelHeader
        title="Authenticator app"
        subtitle="A 6-digit code from your phone at sign-in and before sensitive actions"
        action={
          status.isLoading ? null : enabled ? (
            <Badge tone="success" dot>
              On
            </Badge>
          ) : (
            <Badge tone={data?.required ? "warning" : "neutral"} dot>
              {data?.required ? "Required, not set up" : "Off"}
            </Badge>
          )
        }
      />
      <div className="px-6 pb-6 pt-4">
        {status.isError ? (
          <ErrorState message={errorMessage(status.error, "Could not load your authenticator status.")} onRetry={() => void status.refetch()} />
        ) : status.isLoading || !data ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <KeyValue
              columns={3}
              items={[
                { label: "Status", value: enabled ? `On since ${day(data.enabledAt)}` : data.pendingSetup ? "Setup started, not confirmed" : "Not set up" },
                { label: "Recovery codes left", value: enabled ? `${data.recoveryCodesLeft} of 10` : undefined },
                { label: "Remembered devices", value: enabled ? String(data.trustedDevices) : undefined },
              ]}
            />
            {enabled && data.recoveryCodesLeft <= 2 ? (
              <p className="mt-3 rounded-xl bg-warning-soft px-3 py-2 text-xs font-semibold text-warning">
                Only {data.recoveryCodesLeft} recovery code{data.recoveryCodesLeft === 1 ? "" : "s"} left. Generate a new set before you run out.
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {enabled ? (
                <>
                  <Button variant="outline" icon={RefreshCw} onClick={() => setRegenOpen(true)}>
                    Regenerate recovery codes
                  </Button>
                  <Button variant="outline" icon={ShieldOff} className="text-danger" onClick={() => setDisableOpen(true)} disabled={data.required}>
                    Turn off
                  </Button>
                  {data.required ? <span className="self-center text-xs text-ink-faint">Required for your role, so it cannot be turned off.</span> : null}
                </>
              ) : (
                <Button icon={ShieldCheck} onClick={() => setSetupOpen(true)}>
                  Set up
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <Drawer open={setupOpen} onClose={() => setSetupOpen(false)} width="sm" title="Authenticator app">
        {setupOpen ? (
          <MfaSetupFlow
            compact
            onCancel={() => setSetupOpen(false)}
            onDone={() => {
              setSetupOpen(false);
              clearMfaSetupDeadline();
              refresh();
              if (params.get("setup")) router.replace(settingsHref("security"));
              toast.success("Authenticator turned on");
            }}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={disableOpen}
        onClose={() => {
          setDisableOpen(false);
          resetPrompt();
        }}
        onConfirm={() => disable.mutate(useRecovery ? code.trim().toUpperCase() : code)}
        tone="danger"
        title="Turn off your authenticator?"
        description="Sign-in goes back to a password alone and your recovery codes stop working. Enter a current code to confirm."
        confirmLabel="Turn off"
        loading={disable.isPending}
        disabled={!codeReady(code, useRecovery)}
      >
        <CodePrompt value={code} onChange={setCode} useRecovery={useRecovery} onToggle={() => setUseRecovery((v) => !v)} autoFocus />
      </ConfirmDialog>

      <ConfirmDialog
        open={regenOpen && !newCodes}
        onClose={() => {
          setRegenOpen(false);
          resetPrompt();
        }}
        onConfirm={() => regenerate.mutate(useRecovery ? code.trim().toUpperCase() : code)}
        tone="warning"
        icon={KeyRound}
        title="Generate new recovery codes?"
        description="Your current codes stop working the moment the new ten are issued. Enter a code to confirm."
        confirmLabel="Generate"
        loading={regenerate.isPending}
        disabled={!codeReady(code, useRecovery)}
      >
        <CodePrompt value={code} onChange={setCode} useRecovery={useRecovery} onToggle={() => setUseRecovery((v) => !v)} autoFocus />
      </ConfirmDialog>

      <Drawer
        open={Boolean(newCodes)}
        onClose={() => {
          setNewCodes(null);
          setRegenOpen(false);
        }}
        width="sm"
        title="Your new recovery codes"
        subtitle="Shown once. The old codes no longer work."
        footer={
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setNewCodes(null);
                setRegenOpen(false);
              }}
            >
              I saved them
            </Button>
          </div>
        }
      >
        {newCodes ? (
          <>
            <ol className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface p-4 font-mono text-sm font-semibold tracking-wider text-ink">
              {newCodes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={newCodes.join("\n")} label="Copy codes" />
              <DownloadButton name="pickriders-admin-recovery-codes.txt" text={recoveryCodesText(newCodes)} />
            </div>
          </>
        ) : null}
      </Drawer>
    </Panel>
  );
}

export function SessionsPanel() {
  const sessions = useSessions();
  const { logout } = useAuth();
  const [revoking, setRevoking] = useState<AdminSession | null>(null);
  const [othersOpen, setOthersOpen] = useState(false);

  const revoke = useAction((sessionId: string) => auth.revokeSession(sessionId), {
    success: "Session signed out",
    invalidate: [["me", "sessions"]],
    onSuccess: () => setRevoking(null),
  });
  const revokeOthers = useAction(() => auth.revokeOtherSessions(), {
    success: (data) => (data.revoked ? `Signed out ${data.revoked} other session${data.revoked === 1 ? "" : "s"}` : "No other sessions were open"),
    invalidate: [["me", "sessions"]],
    onSuccess: () => setOthersOpen(false),
  });

  const list = [...(sessions.data?.sessions ?? [])].sort((a, b) => Number(b.current) - Number(a.current) || b.lastSeenAt.localeCompare(a.lastSeenAt));
  const others = list.filter((s) => !s.current).length;

  return (
    <Panel>
      <PanelHeader
        title="Where you are signed in"
        subtitle="Every device with an open session on your account"
        action={
          others > 0 ? (
            <Button size="sm" variant="outline" icon={LogOut} onClick={() => setOthersOpen(true)}>
              Sign out everywhere else
            </Button>
          ) : null
        }
      />
      <div className="px-6 pb-6 pt-4">
        {sessions.isError ? (
          <ErrorState message={errorMessage(sessions.error, "Could not load your sessions.")} onRetry={() => void sessions.refetch()} />
        ) : sessions.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !list.length ? (
          <EmptyState compact icon={MonitorSmartphone} title="No sessions" description="Sessions appear here after you sign in." />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((session) => {
              const Icon = deviceIcon(session);
              return (
                <li key={session.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", session.current ? "bg-brand-soft text-brand-dark" : "bg-surface text-ink-muted")}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                      <span className="truncate">{deviceLabel(session)}</span>
                      {session.current ? <Badge tone="brand">This device</Badge> : null}
                      {session.trustedUntil && new Date(session.trustedUntil).getTime() > Date.now() ? <Badge tone="neutral">Remembered</Badge> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {session.ip ? `${session.ip} · ` : ""}
                      last seen {ago(session.lastSeenAt)} · signed in {when(session.createdAt)}
                    </p>
                  </div>
                  {session.current ? (
                    <Button size="sm" variant="ghost" icon={LogOut} onClick={() => void logout()}>
                      Sign out
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-danger" onClick={() => setRevoking(session)}>
                      Sign out device
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(revoking)}
        onClose={() => setRevoking(null)}
        onConfirm={() => revoking && revoke.mutate(revoking.id)}
        tone="warning"
        title="Sign out this device?"
        description={revoking ? `${deviceLabel(revoking)}${revoking.ip ? ` (${revoking.ip})` : ""} will be signed out immediately. It can sign in again with your password and a code.` : undefined}
        confirmLabel="Sign out device"
        loading={revoke.isPending}
      />
      <ConfirmDialog
        open={othersOpen}
        onClose={() => setOthersOpen(false)}
        onConfirm={() => revokeOthers.mutate(undefined)}
        tone="danger"
        title="Sign out everywhere else?"
        description={`${others} other session${others === 1 ? "" : "s"} will be signed out. This device stays signed in. Remembered devices will need a code next time.`}
        confirmLabel="Sign out everywhere else"
        loading={revokeOthers.isPending}
      />
    </Panel>
  );
}

export function SecurityTab() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AuthenticatorPanel />
      <SessionsPanel />
    </div>
  );
}
