"use client";

import { UI } from "@/components/ui";
import { useGetUserQuery } from "@/api";

export const UserDetailsForm = () => {
  const { data, isLoading } = useGetUserQuery();

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[0, 1, 2, 3].map((i) => (
          <UI.Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <form className="space-y-5">
      <UI.Input
        type="text"
        id="first-name"
        placeholder="First Name"
        defaultValue={data?.firstname ?? ""}
        labelValue="First Name"
      />
      <UI.Input
        type="text"
        id="last-name"
        placeholder="Last Name"
        defaultValue={data?.lastname ?? ""}
        labelValue="Last Name"
      />
      <UI.Input
        type="email"
        id="email"
        placeholder="Email"
        defaultValue={data?.email ?? ""}
        labelValue="Email"
      />
      <UI.Input
        type="tel"
        id="number"
        placeholder="Phone number"
        defaultValue={data?.phone ?? ""}
        labelValue="Phone number"
      />
      <UI.PrimaryButton className="w-full" disabled>
        Save changes
      </UI.PrimaryButton>
    </form>
  );
};
