"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Building2, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Avatar, Badge, Button, DataTable, Drawer, Field, Input, KeyValue, Select, cx, type ColumnMeta, type FilterSpec, type Tone } from "@/components/kit";
import { StatusDrawer, normalizePhone, phoneLabel } from "@/components/users/user-actions";
import { asArray, users, type Team, type User } from "@/lib/admin/api";
import { PLATFORM_STAFF_ROLES } from "@/lib/admin-access";
import { ago, fullName, when } from "@/lib/admin/format";
import { useAction, useCountries, useTeams, useUser, useUsers } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { pageFilter } from "./fields";

/**
 * Team: the platform staff (users holding a staff role), plus the business and
 * developer organisations the core calls "teams". A member opens in a drawer
 * (`?member=<id>`), the add form in another (`?add=1`).
 */
const STAFF = PLATFORM_STAFF_ROLES as readonly string[];

const STATUS_TONE: Record<string, Tone> = { ACTIVE: "success", INACTIVE: "neutral", SUSPENDED: "warning", BANNED: "danger" };
const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  PLATFORM_ADMIN: "Platform admin",
  PLATFORM_MANAGER: "Manager",
  PLATFORM_OPERATION: "Operations",
  PLATFORM_FINANCE: "Finance",
  USER: "User",
  PLATFORM_RIDER: "Platform rider",
  DEVELOPER: "Developer",
};

/** POST /admins/users only accepts these; staff roles are assigned on the backend. */
const CREATABLE_ROLES = ["USER", "PLATFORM_RIDER", "DEVELOPER"] as const;

const FILTERS: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    options: ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"].map((value) => ({ value, label: ROLE_LABEL[value] ?? value.charAt(0) + value.slice(1).toLowerCase() })),
  },
  { key: "role", label: "Role", options: STAFF.map((value) => ({ value, label: ROLE_LABEL[value] ?? value })) },
];

const meta = (value: ColumnMeta) => value;

const staffRoles = (user: User) => (user.roles ?? []).filter((role) => STAFF.includes(role));

const STAFF_COLUMNS: ColumnDef<User, unknown>[] = [
  {
    id: "member",
    header: "Member",
    meta: meta({ csv: { key: "name", label: "Name", value: (row) => fullName(row as User) } }),
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <Avatar src={row.original.photo} name={fullName(row.original)} size={32} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">{fullName(row.original) || "Unnamed"}</span>
          <span className="block truncate text-[11px] text-ink-muted">{row.original.email}</span>
        </span>
      </span>
    ),
  },
  {
    id: "roles",
    header: "Role",
    meta: meta({ csv: { key: "roles", label: "Roles", value: (row) => staffRoles(row as User).join(" ") } }),
    cell: ({ row }) => (
      <span className="flex flex-wrap gap-1">
        {staffRoles(row.original).map((role) => (
          <Badge key={role} tone="brand">
            {ROLE_LABEL[role] ?? role}
          </Badge>
        ))}
      </span>
    ),
  },
  {
    id: "phone",
    header: "Phone",
    meta: meta({ hideBelow: "lg", csv: { key: "phone", label: "Phone", value: (row) => phoneLabel((row as User).phone) } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{phoneLabel(row.original.phone)}</span>,
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ csv: { key: "status", label: "Status" } }),
    cell: ({ row }) => (
      <Badge tone={STATUS_TONE[row.original.status] ?? "neutral"} dot>
        {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
      </Badge>
    ),
  },
  {
    id: "lastLogin",
    header: "Last login",
    meta: meta({ sortKey: "lastLoginDate", hideBelow: "md", csv: { key: "lastLoginDate", label: "Last login" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{row.original.lastLoginDate ? ago(row.original.lastLoginDate) : "Never"}</span>,
  },
  {
    id: "createdAt",
    header: "Added",
    meta: meta({ sortKey: "createdAt", hideBelow: "xl", csv: { key: "createdAt", label: "Added" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
];

const TEAM_COLUMNS: ColumnDef<Team, unknown>[] = [
  {
    id: "name",
    header: "Team",
    meta: meta({ csv: { key: "name", label: "Name" } }),
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <Avatar src={row.original.logo as string | undefined} name={row.original.name} size={32} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">{row.original.name ?? "Unnamed"}</span>
          <span className="block truncate text-[11px] text-ink-muted">@{String(row.original.handle ?? "")}</span>
        </span>
      </span>
    ),
  },
  {
    id: "entityType",
    header: "Type",
    meta: meta({ csv: { key: "entityType", label: "Type" } }),
    cell: ({ row }) => <Badge tone={row.original.entityType === "BUSINESS" ? "info" : "brand"}>{row.original.entityType === "BUSINESS" ? "Business" : "Developer"}</Badge>,
  },
  {
    id: "contact",
    header: "Contact",
    meta: meta({ hideBelow: "md", csv: { key: "contactPersonEmail", label: "Contact email" } }),
    cell: ({ row }) => (
      <span className="min-w-0">
        <span className="block truncate text-sm text-ink">{String(row.original.contactPersonEmail ?? "")}</span>
        <span className="block text-[11px] text-ink-muted">{phoneLabel(row.original.contactPersonPhone as string | undefined)}</span>
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ csv: { key: "status", label: "Status" } }),
    cell: ({ row }) => {
      const status = String(row.original.status ?? "ACTIVE");
      return (
        <Badge tone={STATUS_TONE[status] ?? "neutral"} dot>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    header: "Created",
    meta: meta({ hideBelow: "lg", csv: { key: "createdAt", label: "Created" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
];

export function TeamTab() {
  const table = useTableState({ limit: 20 });
  const view = table.state.filters.view === "teams" ? "teams" : "staff";
  const memberId = table.state.filters.member;
  const adding = table.state.filters.add === "1";
  const setView = (next: "staff" | "teams") => table.update({ view: next === "staff" ? undefined : next, status: undefined, role: undefined });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-card p-1">
          {(
            [
              { id: "staff", label: "Platform staff", icon: ShieldCheck },
              { id: "teams", label: "Business and developer teams", icon: Building2 },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                view === item.id ? "bg-ink text-card" : "text-ink-muted hover:text-ink",
              )}
            >
              <item.icon size={13} />
              {item.label}
            </button>
          ))}
        </div>
        {view === "staff" ? (
          <Button icon={UserPlus} onClick={() => table.update({ add: "1" }, { resetPage: false })}>
            Add member
          </Button>
        ) : null}
      </div>

      {view === "staff" ? <StaffTable onOpen={(id) => table.update({ member: id }, { resetPage: false })} /> : <TeamsTable />}

      <MemberDrawer userId={memberId} onClose={() => table.update({ member: undefined }, { resetPage: false })} />
      <AddMemberDrawer open={adding} onClose={() => table.update({ add: undefined }, { resetPage: false })} />
    </div>
  );
}

function StaffTable({ onOpen }: { onOpen: (id: string) => void }) {
  const table = useTableState({ limit: 20, sortBy: "createdAt", order: "DESC" });
  const query = useMemo(() => {
    // Drawer and view params live in the URL too; they are not API filters.
    const { view: _view, member: _member, add: _add, role, ...filters } = table.state.filters;
    void _view;
    void _member;
    void _add;
    const { page, limit, sortBy, order, dateRange } = table.query;
    return { page, limit, sortBy, order, dateRange, ...filters, role: role || STAFF.join(","), userSearch: table.state.search };
  }, [table.query, table.state.filters, table.state.search]);
  const staff = useUsers(query);

  return (
    <DataTable<User>
      columns={STAFF_COLUMNS}
      data={staff.data}
      loading={staff.isLoading || staff.isFetching}
      error={staff.isError ? errorMessage(staff.error) : null}
      onRetry={() => void staff.refetch()}
      filters={FILTERS}
      searchPlaceholder="Search name, email or phone"
      csvName="platform-staff"
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      emptyIcon={Users}
      emptyTitle="No staff match"
      emptyDescription="Staff roles are assigned on the backend; accounts created here start as users."
      onRowClick={(row) => onOpen(row._id)}
      mobileCard={(row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photo} name={fullName(row)} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{fullName(row) || "Unnamed"}</p>
            <p className="truncate text-[11px] text-ink-muted">{row.email}</p>
            <p className="mt-1 flex flex-wrap gap-1">
              {staffRoles(row).map((role) => (
                <Badge key={role} tone="brand">
                  {ROLE_LABEL[role] ?? role}
                </Badge>
              ))}
            </p>
          </div>
          <Badge tone={STATUS_TONE[row.status] ?? "neutral"} dot>
            {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
          </Badge>
        </div>
      )}
    />
  );
}

function TeamsTable() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => {
    const { view: _view, member: _member, add: _add, ...filters } = table.state.filters;
    void _view;
    void _member;
    void _add;
    const { page, limit, order, dateRange } = table.query;
    return { page, limit, order, dateRange, ...filters };
  }, [table.query, table.state.filters]);
  const teams = useTeams(query);
  // The teams endpoint has no text search, so the box filters the loaded page.
  const data = useMemo(
    () => (teams.data ? { ...teams.data, items: pageFilter(teams.data.items, table.state.search, (t) => [t.name, t.handle, t.contactPersonEmail]) } : undefined),
    [teams.data, table.state.search],
  );

  return (
    <DataTable<Team>
      columns={TEAM_COLUMNS}
      data={data}
      loading={teams.isLoading || teams.isFetching}
      error={teams.isError ? errorMessage(teams.error) : null}
      onRetry={() => void teams.refetch()}
      searchPlaceholder="Filter this page by name or handle"
      csvName="teams"
      emptyIcon={Building2}
      emptyTitle="No teams yet"
      emptyDescription="Business and developer organisations appear here once created through the API."
      mobileCard={(row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.logo as string | undefined} name={row.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{row.name}</p>
            <p className="truncate text-[11px] text-ink-muted">{String(row.contactPersonEmail ?? "")}</p>
          </div>
          <Badge tone={row.entityType === "BUSINESS" ? "info" : "brand"}>{row.entityType === "BUSINESS" ? "Business" : "Developer"}</Badge>
        </div>
      )}
    />
  );
}

function MemberDrawer({ userId, onClose }: { userId?: string; onClose: () => void }) {
  const user = useUser(userId ?? "");
  const [statusOpen, setStatusOpen] = useState(false);
  const member = user.data;

  return (
    <Drawer open={Boolean(userId)} onClose={onClose} title={member ? fullName(member) || "Team member" : "Team member"} subtitle={member?.email}>
      {user.isError ? (
        <p className="text-sm font-semibold text-danger">{errorMessage(user.error)}</p>
      ) : !member ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl bg-line" />
          <div className="h-32 animate-pulse rounded-xl bg-line" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={member.photo} name={fullName(member)} size={56} />
            <div className="min-w-0">
              <p className="truncate text-base font-black text-ink">{fullName(member) || "Unnamed"}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {staffRoles(member).length ? (
                  staffRoles(member).map((role) => (
                    <Badge key={role} tone="brand">
                      {ROLE_LABEL[role] ?? role}
                    </Badge>
                  ))
                ) : (
                  <Badge>No staff role</Badge>
                )}
                <Badge tone={STATUS_TONE[member.status] ?? "neutral"} dot>
                  {member.status.charAt(0) + member.status.slice(1).toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>
          <KeyValue
            items={[
              { label: "Email", value: member.email },
              { label: "Phone", value: phoneLabel(member.phone) },
              { label: "All roles", value: (member.roles ?? []).map((r) => ROLE_LABEL[r] ?? r).join(", ") },
              { label: "Country", value: member.country ? String((member.country as { name?: string }).name ?? member.country) : undefined },
              { label: "Last login", value: member.lastLoginDate ? when(member.lastLoginDate) : "Never" },
              { label: "Added", value: when(member.createdAt) },
            ]}
          />
          <p className="text-xs text-ink-faint">Profile fields are read only: the core API has no admin endpoint to edit another user&apos;s details or roles.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant={member.status === "ACTIVE" ? "danger" : "primary"} onClick={() => setStatusOpen(true)}>
              {member.status === "ACTIVE" ? "Suspend or remove access" : "Change status"}
            </Button>
          </div>
          <StatusDrawer user={member} open={statusOpen} onClose={() => setStatusOpen(false)} />
        </div>
      )}
    </Drawer>
  );
}

type AddForm = { firstname: string; lastname: string; email: string; phone: string; password: string; role: string; countryCode: string };
const EMPTY: AddForm = { firstname: "", lastname: "", email: "", phone: "", password: "", role: "USER", countryCode: "NG" };

function AddMemberDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<AddForm>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const countries = useCountries();
  const list = asArray(countries.data);
  const create = useAction((body: Record<string, unknown>) => users.create(body), {
    success: "Account created",
    invalidate: ["users", "customers"],
    onSuccess: () => {
      setForm(EMPTY);
      onClose();
    },
  });
  const set = (key: keyof AddForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const phone = normalizePhone(form.phone);
    if (form.firstname.trim().length < 3 || form.lastname.trim().length < 3) return setError("First and last name need at least 3 characters.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email.");
    if (!phone) return setError("Enter a valid phone number.");
    if (form.password.length < 8) return setError("Password needs at least 8 characters.");
    setError(null);
    const country = list.find((c) => c.code === form.countryCode);
    create.mutate({
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim().toLowerCase(),
      phone,
      password: form.password,
      role: form.role,
      country: { name: country?.name ?? "Nigeria", code: country?.code ?? "NG", currency: String(country?.currencyCode ?? country?.currency ?? "NGN") },
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add team member"
      subtitle="Creates an account on the platform. Super admin only."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-member" loading={create.isPending}>
            Create account
          </Button>
        </div>
      }
    >
      <form id="add-member" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First name">
            <Input value={form.firstname} onChange={(e) => set("firstname")(e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Last name">
            <Input value={form.lastname} onChange={(e) => set("lastname")(e.target.value)} autoComplete="off" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Phone" hint="0803…, 234803… or +234803… all work.">
          <Input type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Temporary password" hint="At least 8 characters. Share it out of band.">
          <Input type="password" value={form.password} onChange={(e) => set("password")(e.target.value)} autoComplete="new-password" />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Role" hint="Staff roles are assigned directly on the backend for now.">
            <Select value={form.role} onChange={(e) => set("role")(e.target.value)}>
              {CREATABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
              {STAFF.map((role) => (
                <option key={role} value={role} disabled>
                  {ROLE_LABEL[role] ?? role} (backend only)
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Country">
            <Select value={form.countryCode} onChange={(e) => set("countryCode")(e.target.value)}>
              {list.length ? (
                list.map((country) => (
                  <option key={country._id} value={country.code}>
                    {country.name}
                  </option>
                ))
              ) : (
                <option value="NG">Nigeria</option>
              )}
            </Select>
          </Field>
        </div>
        {error ? <p className="text-xs font-semibold text-danger">{error}</p> : null}
      </form>
    </Drawer>
  );
}
