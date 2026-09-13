"use client";

import { ArrowLeft, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Avatar, Badge, ErrorState, KeyValue, LinkButton, PageHeader, Panel, PanelHeader, Skeleton, statusTone } from "@/components/kit";
import { UserActions, phoneLabel } from "@/components/users/user-actions";
import { LICENCE_LABEL, licenceOf, licenceTone } from "@/components/users/user-panels";
import { day, fullName, statusLabel, when } from "@/lib/admin/format";
import { useUser, useUserWallets } from "@/lib/admin/hooks";
import { asArray } from "@/lib/admin/api";

/**
 * The rider's profile as the API holds it. Riders edit their own names,
 * photo and documents in the rider app; the admin can change what the API
 * lets it change (phone, status, wallet, dispatch) from the actions here.
 */
function CourierProfile({ id }: { id: string }) {
  const user = useUser(id);
  const wallets = useUserWallets(id);
  const wallet = asArray(wallets.data)[0] ?? null;
  const u = user.data;
  const raw = (u ?? {}) as Record<string, unknown>;
  const licence = licenceOf(u);

  if (user.error && !u) {
    return (
      <div>
        <PageHeader breadcrumb={<Link href="/couriers">Couriers</Link>} title="Rider profile" />
        <ErrorState message="Could not load this rider." onRetry={() => user.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={
          <Link href={`/couriers/${id}/details`} className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={12} /> Back to rider
          </Link>
        }
        title="Rider profile"
        description="Everything on the account record."
        actions={
          <LinkButton href={`/couriers/${id}/verification`} icon={ShieldCheck}>
            Licence
          </LinkButton>
        }
      />

      <Panel className="p-5">
        {user.isLoading || !u ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <Avatar src={u.photo} name={fullName(u)} size={96} />
              <Badge tone={licenceTone(licence.status)}>{LICENCE_LABEL[licence.status]}</Badge>
            </div>
            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-ink">{fullName(u) || "Unnamed rider"}</h2>
                <Badge tone={statusTone(u.status)} dot>
                  {statusLabel(u.status)}
                </Badge>
                <Badge tone={u.isOnline ? "success" : "neutral"} dot>
                  {u.isOnline ? "Online" : "Offline"}
                </Badge>
                {u.dispatchPaused ? <Badge tone="warning">Dispatch paused</Badge> : null}
              </div>
              <KeyValue
                columns={3}
                items={[
                  { label: "First name", value: u.firstname },
                  { label: "Last name", value: u.lastname },
                  { label: "Middle name", value: u.middlename },
                  { label: "Phone", value: u.phone ? `${phoneLabel(u.phone)}${u.phoneVerified ? " (verified)" : ""}` : undefined },
                  { label: "Email", value: u.email ? `${u.email}${u.emailVerified ? " (verified)" : ""}` : undefined },
                  { label: "Gender", value: u.gender ? statusLabel(u.gender) : undefined },
                  { label: "Date of birth", value: typeof raw.dob === "string" && raw.dob ? day(raw.dob) : undefined },
                  { label: "NIN", value: u.nin },
                  { label: "BVN", value: u.bvnVerified ? "Verified" : "Not verified" },
                  { label: "Licence number", value: licence.number || undefined },
                  { label: "Country / state", value: [u.country, u.state].filter(Boolean).join(" / ") || undefined },
                  { label: "Roles", value: u.roles?.length ? u.roles.map((r) => statusLabel(r)).join(", ") : undefined },
                  { label: "Joined", value: day(u.createdAt) },
                  { label: "Last sign-in", value: u.lastLoginDate ? when(u.lastLoginDate) : "Never" },
                  { label: "Business", value: u.businessId ? String(u.businessId) : undefined },
                ]}
              />
            </div>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Account actions" subtitle="What the admin can change on this record. Every action is audited." />
        <div className="px-5 pb-5 pt-4">
          {u ? <UserActions user={u} wallet={wallet} showDispatch /> : <Skeleton className="h-10 w-full" />}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-xs text-ink">
            <Info size={15} className="mt-0.5 shrink-0 text-info" />
            <p>
              Names, photo and documents are edited by the rider in the rider app. Licence approval lives on the{" "}
              <Link href={`/couriers/${id}/verification`} className="font-bold underline">
                licence page
              </Link>
              .
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default function CourierEditPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CourierProfile id={params.id} />
    </Suspense>
  );
}
