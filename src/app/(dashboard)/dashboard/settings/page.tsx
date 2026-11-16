import { Suspense } from "react";

import { Skeleton } from "@/components/kit";

import { SettingsClient } from "./_components/settings-client";

export default function SettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <SettingsClient />
    </Suspense>
  );
}
