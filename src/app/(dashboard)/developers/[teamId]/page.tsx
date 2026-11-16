"use client";

import { Suspense } from "react";

import { Skeleton } from "@/components/kit";
import { DeveloperTeamPage } from "@/components/developers/team/team-page";

export default function DeveloperTeamRoute({ params }: { params: { teamId: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DeveloperTeamPage teamId={params.teamId} />
    </Suspense>
  );
}
