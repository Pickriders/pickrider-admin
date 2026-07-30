"use client";

import { Globe2, Users } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";
import { PLATFORM_STAFF_ROLES } from "@/lib/admin-access";

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
    <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-dark">{icon}</span>
    <div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export const AdminStats = () => {
  const { data: staff } = useApiQuery({
    queryKey: ["admin-stats", "staff"],
    queryFn: () => apiService.getUsers({ role: PLATFORM_STAFF_ROLES.join(","), limit: 1 }),
  });
  const { data: countries } = useApiQuery({
    queryKey: ["admin-stats", "countries"],
    queryFn: () => apiService.getCountries({ limit: 1 }),
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:max-w-md">
      <Stat icon={<Users size={18} />} label="Platform staff" value={staff?.totalRecords ?? 0} />
      <Stat icon={<Globe2 size={18} />} label="Countries configured" value={countries?.totalRecords ?? 0} />
    </div>
  );
};
