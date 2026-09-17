"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, Badge, Field, Input, Skeleton, cx } from "@/components/kit/primitives";
import type { User } from "@/lib/admin/api";
import { fullName } from "@/lib/admin/format";
import { useUsers } from "@/lib/admin/hooks";

/**
 * Find people by name, phone or email instead of pasting ids. `only` narrows to couriers or
 * customers; `multiple` turns it into a chip list. Debounced search against GET admins/users.
 */
export function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export type PickedUser = Pick<User, "_id" | "firstname" | "lastname" | "email" | "phone" | "photo" | "isRider">;

function label(user: PickedUser) {
  return fullName(user) || user.email || user.phone || user._id;
}

function Results({
  term,
  only,
  exclude,
  onPick,
}: {
  term: string;
  only?: "couriers" | "customers";
  exclude: Set<string>;
  onPick: (user: User) => void;
}) {
  const results = useUsers(
    {
      userSearch: term,
      limit: 8,
      ...(only === "couriers" ? { isRider: true } : only === "customers" ? { isRider: false } : {}),
    },
    term.length >= 2,
  );
  if (term.length < 2) return null;
  return (
    <div className="rounded-xl border border-line bg-surface">
      {results.isLoading ? (
        <div className="space-y-2 p-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      ) : !results.data?.items.length ? (
        <p className="p-3 text-xs text-ink-muted">Nobody matches “{term}”.</p>
      ) : (
        <ul className="divide-y divide-line">
          {results.data.items.map((user) => (
            <li key={user._id}>
              <button
                type="button"
                disabled={exclude.has(user._id)}
                onClick={() => onPick(user)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-card disabled:opacity-50"
              >
                <Avatar src={user.photo} name={fullName(user)} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{label(user)}</span>
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
  );
}

export function UserPicker({
  value,
  onChange,
  only,
  label: fieldLabel = "Find a person",
  hint = "Name, email or phone. Results appear as you type.",
  disabled,
}: {
  value: PickedUser | null;
  onChange: (next: PickedUser | null) => void;
  only?: "couriers" | "customers";
  label?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term.trim(), 350);

  if (value) {
    return (
      <Field label={fieldLabel}>
        <div
          className={cx(
            "flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2",
            disabled && "opacity-60",
          )}
        >
          <Avatar src={value.photo} name={fullName(value)} size={28} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">{label(value)}</span>
            <span className="block truncate text-[11px] text-ink-muted">
              {value.email ?? ""} {value.phone ? `· ${value.phone}` : ""}
            </span>
          </span>
          {!disabled ? (
            <button
              type="button"
              aria-label="Change"
              onClick={() => onChange(null)}
              className="text-ink-faint hover:text-ink"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </Field>
    );
  }

  return (
    <div className="space-y-2">
      <Field label={fieldLabel} hint={hint}>
        <Input
          left={<Search size={15} />}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search accounts"
          disabled={disabled}
          autoFocus={false}
        />
      </Field>
      <Results
        term={debounced}
        only={only}
        exclude={new Set()}
        onPick={(user) => {
          onChange(user);
          setTerm("");
        }}
      />
    </div>
  );
}

export function UsersPicker({
  picked,
  onChange,
  only,
  label: fieldLabel = "Find people",
  emptyHint = "Nobody picked yet.",
}: {
  picked: PickedUser[];
  onChange: (next: PickedUser[]) => void;
  only?: "couriers" | "customers";
  label?: string;
  emptyHint?: string;
}) {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term.trim(), 350);
  const pickedIds = new Set(picked.map((u) => u._id));

  return (
    <div className="space-y-3">
      <Field label={fieldLabel} hint="Name, email or phone. Results appear as you type.">
        <Input
          left={<Search size={15} />}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search accounts"
        />
      </Field>
      <Results
        term={debounced}
        only={only}
        exclude={pickedIds}
        onPick={(user) => {
          if (!pickedIds.has(user._id)) onChange([...picked, user]);
          setTerm("");
        }}
      />
      {picked.length ? (
        <div className="flex flex-wrap gap-1.5">
          {picked.map((user) => (
            <span
              key={user._id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card py-1 pl-1 pr-2 text-xs font-semibold text-ink"
            >
              <Avatar src={user.photo} name={fullName(user)} size={20} />
              {label(user)}
              <button
                type="button"
                aria-label="Remove"
                onClick={() => onChange(picked.filter((u) => u._id !== user._id))}
                className="text-ink-faint hover:text-danger"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-faint">{emptyHint}</p>
      )}
    </div>
  );
}
