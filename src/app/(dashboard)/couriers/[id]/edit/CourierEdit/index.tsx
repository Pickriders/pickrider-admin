"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, BadgeCheck, Info } from "lucide-react";
import { UI } from "@/components/ui";
import { useGetUserDetailsQuery } from "@/api/queries/user";

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-muted-foreground">{label}</label>
    <div className="flex h-11 items-center rounded-xl border bg-muted/40 px-3 text-sm font-semibold text-foreground">
      {value || <span className="text-muted-foreground">—</span>}
    </div>
  </div>
);

export const CourierEdit = ({ id }: { id: string }) => {
  const { data: user, isLoading } = useGetUserDetailsQuery(id);

  if (isLoading && !user) return <UI.PageLoadingUI />;

  const fullName = user ? `${user.firstname} ${user.lastname}` : "Courier";
  const initials = user ? `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase() : "";
  const licenceApproved = user?.driversLicenseVerified === "APPROVE";

  return (
    <div>
      <Link
        href={`/couriers/${id}/details`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to courier
      </Link>
      <h1 className="mt-3 font-clash-display text-2xl font-semibold text-foreground">Courier profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Full profile details for this courier.</p>

      <section className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3">
            <div className="grid size-28 place-items-center overflow-hidden rounded-3xl bg-primary-black text-4xl font-semibold text-white">
              {user?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photo} alt={fullName} className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span
              className={
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
                (licenceApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")
              }
            >
              <BadgeCheck size={12} />
              {licenceApproved ? "Licence verified" : "Licence pending"}
            </span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" value={user?.firstname} />
            <Field label="Last name" value={user?.lastname} />
            <Field label="Email address" value={user?.email} />
            <Field label="Phone number" value={user?.phone ? `+${user.phone}` : undefined} />
            <Field label="Gender" value={user?.gender} />
            <Field label="Date of birth" value={user?.dob ? dayjs(user.dob).format("DD MMM YYYY") : undefined} />
            <Field label="NIN" value={user?.nin} />
            <Field label="Driver's licence" value={user?.driversLicense} />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/30">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            Editing a courier&apos;s profile from the admin isn&apos;t enabled yet — couriers manage their own details
            in the rider app. Licence approval is available on the{" "}
            <Link href={`/couriers/${id}/verification`} className="font-bold underline">
              verification page
            </Link>
            , and balance/status actions are on the{" "}
            <Link href={`/couriers/${id}/details`} className="font-bold underline">
              details page
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
};
