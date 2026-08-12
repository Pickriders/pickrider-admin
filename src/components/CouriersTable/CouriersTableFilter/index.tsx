import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { status } from "@/constant";
import { useTableUrlFilter, useURLQuery } from "@/hooks";

// Only filters the API actually supports for the rider list. "All" clears the param.
const BVN_OPTIONS = [
  { label: "All couriers", value: "ALL" },
  { label: "BVN verified", value: "true" },
  { label: "Not BVN verified", value: "false" },
];

// Licence KYC status. APPROVE = verified riders (licence approved).
const LICENCE_OPTIONS = [
  { label: "All licences", value: "ALL" },
  { label: "Verified (approved)", value: "APPROVE" },
  { label: "Awaiting review", value: "SUBMITTED" },
  { label: "Not submitted", value: "PENDING" },
  { label: "Disapproved", value: "DISAPPROVE" },
];

export const CouriersTableFilter = () => {
  const { searchParams, updateFilter } = useTableUrlFilter();
  const { removeMultiple } = useURLQuery();

  const FILTER_STATUS = searchParams.get("status") || "ALL";
  const FILTER_LICENCE = searchParams.get("driversLicenseVerified") || "ALL";
  const FILTER_BVN = searchParams.get("bvnVerified") || "ALL";
  const activeCount = [FILTER_STATUS !== "ALL", FILTER_LICENCE !== "ALL", FILTER_BVN !== "ALL"].filter(
    Boolean,
  ).length;

  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button variant="ghost" className="relative">
          <SVG.FilterIcon />
          {activeCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-white">
              {activeCount}
            </span>
          ) : null}
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent sideOffset={10} className="mr-2 sm:mr-10 p-0 w-[92vw] sm:w-[18rem] max-w-[18rem]">
        <div className="flex items-center justify-between border-b px-3 py-3">
          <h4 className="text-sm font-clash-display font-semibold">Filter couriers</h4>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() => removeMultiple(["status", "driversLicenseVerified", "bvnVerified"])}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="space-y-4 px-3 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-montserrat font-semibold text-primary-gray">Status</label>
            <UI.Select value={FILTER_STATUS} onValueChange={(v) => updateFilter("status", v === "ALL" ? "" : v)}>
              <UI.SelectTrigger className="w-full">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectGroup>
                  <UI.SelectItem value="ALL">All statuses</UI.SelectItem>
                  {status.map((stat) => (
                    <UI.SelectItem key={stat} value={stat} className="capitalize">
                      {stat.toLowerCase()}
                    </UI.SelectItem>
                  ))}
                </UI.SelectGroup>
              </UI.SelectContent>
            </UI.Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-montserrat font-semibold text-primary-gray">Licence</label>
            <UI.Select
              value={FILTER_LICENCE}
              onValueChange={(v) => updateFilter("driversLicenseVerified", v === "ALL" ? "" : v)}
            >
              <UI.SelectTrigger className="w-full">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectGroup>
                  {LICENCE_OPTIONS.map((o) => (
                    <UI.SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </UI.SelectItem>
                  ))}
                </UI.SelectGroup>
              </UI.SelectContent>
            </UI.Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-montserrat font-semibold text-primary-gray">BVN verification</label>
            <UI.Select
              value={FILTER_BVN}
              onValueChange={(v) => updateFilter("bvnVerified", v === "ALL" ? "" : v)}
            >
              <UI.SelectTrigger className="w-full">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectGroup>
                  {BVN_OPTIONS.map((o) => (
                    <UI.SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </UI.SelectItem>
                  ))}
                </UI.SelectGroup>
              </UI.SelectContent>
            </UI.Select>
          </div>
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
