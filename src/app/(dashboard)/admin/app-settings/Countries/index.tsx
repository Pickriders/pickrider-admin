"use client";

import { UI } from "@/components/ui";
import { ChevronRight, Globe2, Plus } from "lucide-react";
import Link from "next/link";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

export const Countries = () => {
  const { data, isLoading } = useApiQuery({
    queryKey: ["app-config", "countries"],
    queryFn: () => apiService.getCountries({ limit: 50 }),
  });

  const countries = data?.results ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Countries</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure pricing, withdrawals and per-state dispatch rules for each country.
          </p>
        </div>
        <UI.Button asChild>
          <Link href={"/admin/app-settings/add-country"} className="flex items-center gap-1.5">
            <Plus size={15} /> Add country
          </Link>
        </UI.Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {countries.length
          ? countries.map((c) => (
              <Link
                key={c._id}
                href={`/admin/app-settings/country/${c._id}`}
                className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
                  <Globe2 size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.code} · {c.currencyCode}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-muted-foreground transition-colors group-hover:text-primary"
                />
              </Link>
            ))
          : isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[5.6rem] animate-pulse rounded-2xl border bg-muted/40" />
              ))
            : (
                <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  No countries configured yet.
                </div>
              )}
      </div>
    </div>
  );
};
