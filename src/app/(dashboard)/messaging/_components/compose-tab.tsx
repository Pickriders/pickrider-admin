"use client";

import { Mail, Search, Send, Smartphone, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Avatar, Badge, Button, ConfirmDialog, Field, Input, Panel, PanelHeader, Select, Skeleton, Switch, Textarea, cx } from "@/components/kit";
import { asArray, messaging, type BroadcastEstimate, type BroadcastInput, type User, type UserStatus } from "@/lib/admin/api";
import { count, fullName } from "@/lib/admin/format";
import { useAction, useBroadcastEstimate, useCountries, useUsers } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { EmailPreview, PushPreview } from "./previews";
import { AUDIENCES, AUDIENCE_LABEL, type Audience, type Channel } from "./shared";

/**
 * Compose a broadcast. The audience can be prefilled with `?audience=RIDERS`
 * (the couriers, customers and business pages link here). Reach is estimated
 * live from the same filters the send will use.
 */
const STATUSES: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
];
const SUBJECT_MAX = 120;
const MESSAGE_MAX = 2000;

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function ComposeTab() {
  const router = useRouter();
  const params = useSearchParams();
  const prefill = params.get("audience");
  const [audience, setAudience] = useState<Audience>(AUDIENCES.some((a) => a.id === prefill) ? (prefill as Audience) : "CUSTOMERS");
  const [status, setStatus] = useState<UserStatus[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [licenceApprovedOnly, setLicenceApprovedOnly] = useState(false);
  const [country, setCountry] = useState("");
  const [picked, setPicked] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>(["PUSH"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (prefill && AUDIENCES.some((a) => a.id === prefill)) setAudience(prefill as Audience);
  }, [prefill]);

  const countries = useCountries();
  const isRiders = audience === "RIDERS";
  const isUsers = audience === "USERS";

  const target = useMemo<Pick<BroadcastInput, "audience" | "userIds" | "filters">>(() => {
    if (isUsers) return { audience, userIds: picked.map((u) => u._id) };
    return {
      audience,
      filters: {
        ...(status.length ? { status } : {}),
        ...(isRiders && onlineOnly ? { onlineOnly: true } : {}),
        ...(isRiders && licenceApprovedOnly ? { licenceApprovedOnly: true } : {}),
        ...(country ? { country } : {}),
      },
    };
  }, [audience, isUsers, isRiders, picked, status, onlineOnly, licenceApprovedOnly, country]);
  const debouncedTarget = useDebounced(target, 400);
  const estimate = useBroadcastEstimate(debouncedTarget, !isUsers || picked.length > 0);
  const reach = (estimate.data ?? null) as BroadcastEstimate | null;
  const total = reach ? (reach.total ?? reach.recipients ?? 0) : 0;

  const send = useAction((body: BroadcastInput) => messaging.send(body), {
    success: "Broadcast queued",
    invalidate: ["broadcasts", "notification-log", ["stats", "attention"]],
    onSuccess: (created) => {
      setConfirm(false);
      router.push(`/messaging?tab=history&id=${created._id}`);
    },
  });

  const problems: string[] = [];
  if (!channels.length) problems.push("Pick at least one channel.");
  if (subject.trim().length < 3) problems.push("Subject needs at least 3 characters.");
  if (message.trim().length < 5) problems.push("Message needs at least 5 characters.");
  if (isUsers && !picked.length) problems.push("Pick at least one person.");
  if (!isUsers && reach && total === 0) problems.push("Nobody matches that audience.");
  const ready = problems.length === 0;

  const toggleStatus = (value: UserStatus) => setStatus((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]));
  const toggleChannel = (value: Channel) => setChannels((c) => (c.includes(value) ? c.filter((v) => v !== value) : [...c, value]));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader title="Who" subtitle="The segment this goes to" />
          <div className="p-5 pt-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AUDIENCES.map((item) => {
                const active = item.id === audience;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAudience(item.id)}
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active ? "border-transparent bg-ink text-card" : "border-line bg-card hover:bg-surface",
                    )}
                  >
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className={cx("block text-[11px]", active ? "text-card/70" : "text-ink-muted")}>{item.hint}</span>
                  </button>
                );
              })}
            </div>

            {isUsers ? (
              <PeoplePicker picked={picked} onChange={setPicked} />
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-ink-muted">Account status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((item) => {
                      const active = status.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleStatus(item.value)}
                          className={cx(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                            active ? "border-transparent bg-brand text-brand-ink" : "border-line text-ink-muted hover:bg-surface",
                          )}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-faint">Nothing picked means active accounts only.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Country" hint="Leave empty for everywhere">
                    <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="">All countries</option>
                      {asArray(countries.data).map((c) => (
                        <option key={c._id} value={c.code ?? ""}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {isRiders ? (
                    <div className="flex flex-col justify-end gap-3 pb-1">
                      <Switch checked={onlineOnly} onChange={setOnlineOnly} label="Online right now only" />
                      <Switch checked={licenceApprovedOnly} onChange={setLicenceApprovedOnly} label="Approved licence only" />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="What" subtitle="Channels, subject and the message itself" />
          <div className="space-y-4 p-5 pt-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-ink-muted">Channels</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "PUSH", label: "Push notification", icon: Smartphone, hint: reach ? `${count(reach.withPush)} can receive` : "" },
                    { id: "EMAIL", label: "Email", icon: Mail, hint: reach ? `${count(reach.withEmail)} can receive` : "" },
                  ] as const
                ).map((item) => {
                  const active = channels.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      onClick={() => toggleChannel(item.id)}
                      className={cx(
                        "flex min-w-[12rem] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        active ? "border-brand bg-brand-soft" : "border-line bg-card hover:bg-surface",
                      )}
                    >
                      <span className={cx("grid h-9 w-9 place-items-center rounded-lg", active ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted")}>
                        <item.icon size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-ink">{item.label}</span>
                        <span className="block text-[11px] text-ink-muted">{item.hint || "Everyone also gets an in-app copy"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Field
              label={
                <span className="flex justify-between">
                  <span>Subject</span>
                  <span className={cx("font-medium", subject.length > SUBJECT_MAX ? "text-danger" : "text-ink-faint")}>
                    {subject.length}/{SUBJECT_MAX}
                  </span>
                </span>
              }
            >
              <Input value={subject} maxLength={SUBJECT_MAX} onChange={(e) => setSubject(e.target.value)} placeholder="Short and clear, it is the push title too" />
            </Field>
            <Field
              label={
                <span className="flex justify-between">
                  <span>Message</span>
                  <span className={cx("font-medium", message.length > MESSAGE_MAX ? "text-danger" : "text-ink-faint")}>
                    {message.length}/{MESSAGE_MAX}
                  </span>
                </span>
              }
            >
              <Textarea value={message} maxLength={MESSAGE_MAX} onChange={(e) => setMessage(e.target.value)} className="min-h-40" placeholder="Plain text. Line breaks are kept in the email." />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel className="p-5">
          <p className="text-xs font-semibold text-ink-muted">Reaches</p>
          {estimate.isError ? (
            <p className="mt-2 text-sm font-semibold text-danger">{errorMessage(estimate.error)}</p>
          ) : isUsers && !picked.length ? (
            <p className="mt-2 text-sm text-ink-faint">Pick people to see the reach.</p>
          ) : !reach ? (
            <Skeleton className="mt-2 h-8 w-32" />
          ) : (
            <>
              <p className={cx("mt-1 text-3xl font-black tracking-tight text-ink", estimate.isFetching && "opacity-60")}>
                {count(total)} <span className="text-base font-bold text-ink-muted">{total === 1 ? "person" : "people"}</span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {count(reach.withPush)} with push · {count(reach.withEmail)} with email
              </p>
            </>
          )}
          <div className="mt-4 space-y-1">
            {problems.map((problem) => (
              <p key={problem} className="text-[11px] font-semibold text-warning">
                {problem}
              </p>
            ))}
          </div>
          <Button fullWidth className="mt-4" icon={Send} disabled={!ready} onClick={() => setConfirm(true)}>
            Send broadcast
          </Button>
        </Panel>
        {channels.includes("PUSH") ? (
          <Panel className="p-5">
            <PushPreview subject={subject} message={message} />
          </Panel>
        ) : null}
        {channels.includes("EMAIL") ? (
          <Panel className="p-5">
            <EmailPreview subject={subject} message={message} />
          </Panel>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => send.mutate({ ...target, channels, subject: subject.trim(), message: message.trim() })}
        loading={send.isPending}
        title={`Send to ${count(total)} ${total === 1 ? "person" : "people"}?`}
        description={`${AUDIENCE_LABEL[audience]} over ${channels.map((c) => (c === "PUSH" ? "push" : "email")).join(" and ")}. This cannot be recalled once it goes out.`}
        confirmLabel="Send now"
      >
        <div className="rounded-xl border border-line bg-surface p-3">
          <p className="text-sm font-bold text-ink">{subject}</p>
          <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-xs text-ink-muted">{message}</p>
        </div>
      </ConfirmDialog>
    </div>
  );
}

function PeoplePicker({ picked, onChange }: { picked: User[]; onChange: (next: User[]) => void }) {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term.trim(), 350);
  const results = useUsers({ userSearch: debounced, limit: 8 }, debounced.length >= 2);
  const pickedIds = new Set(picked.map((u) => u._id));
  const add = (user: User) => {
    if (!pickedIds.has(user._id)) onChange([...picked, user]);
    setTerm("");
  };

  return (
    <div className="mt-4 space-y-3">
      <Field label="Find people" hint="Name, email or phone. Results appear as you type.">
        <Input left={<Search size={15} />} value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search accounts" />
      </Field>
      {debounced.length >= 2 ? (
        <div className="rounded-xl border border-line bg-surface">
          {results.isLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ) : !results.data?.items.length ? (
            <p className="p-3 text-xs text-ink-muted">Nobody matches.</p>
          ) : (
            <ul className="divide-y divide-line">
              {results.data.items.map((user) => (
                <li key={user._id}>
                  <button
                    type="button"
                    disabled={pickedIds.has(user._id)}
                    onClick={() => add(user)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-card disabled:opacity-50"
                  >
                    <Avatar src={user.photo} name={fullName(user)} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{fullName(user) || user.email || user.phone}</span>
                      <span className="block truncate text-[11px] text-ink-muted">
                        {user.email ?? ""} {user.phone ? `· ${user.phone}` : ""}
                      </span>
                    </span>
                    {user.isRider ? <Badge tone="brand">Courier</Badge> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {picked.length ? (
        <div className="flex flex-wrap gap-1.5">
          {picked.map((user) => (
            <span key={user._id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card py-1 pl-1 pr-2 text-xs font-semibold text-ink">
              <Avatar src={user.photo} name={fullName(user)} size={20} />
              {fullName(user) || user.email || user.phone}
              <button type="button" aria-label="Remove" onClick={() => onChange(picked.filter((u) => u._id !== user._id))} className="text-ink-faint hover:text-danger">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-faint">Nobody picked yet.</p>
      )}
    </div>
  );
}
