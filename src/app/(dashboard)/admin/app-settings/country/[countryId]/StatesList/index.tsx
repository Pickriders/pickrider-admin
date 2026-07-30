"use client";

import { UI } from "@/components/ui";
import { ChevronRight, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

interface StatesListProps {
  countryId: string;
}

export const StatesList: React.FC<StatesListProps> = ({ countryId }) => {
  const { data, isLoading } = useApiQuery({
    queryKey: ["app-config", "states", countryId],
    queryFn: () => apiService.getCountryStates({ countryId }),
  });
  const states = data?.results ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">States</h2>
          <p className="mt-1 text-sm text-muted-foreground">Per-state pricing, dispatch and location-update rules.</p>
        </div>
        <UI.Button asChild>
          <Link href={`/admin/app-settings/country/${countryId}/add-state`} className="flex items-center gap-1.5">
            <Plus size={15} /> Add state
          </Link>
        </UI.Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {states.length ? (
          states.map((s) => (
            <Link
              key={s._id}
              href={`/admin/app-settings/country/${countryId}/states/${s._id}`}
              className="group flex items-center gap-3 rounded-xl border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-sm"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <MapPin size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.code}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground transition-colors group-hover:text-primary" />
            </Link>
          ))
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[4.5rem] animate-pulse rounded-xl border bg-muted/40" />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No states configured yet.
          </div>
        )}
      </div>
    </div>
  );
};
