import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { OrderLocation } from "@/services";
import { Check, Copy, Info, MapPin, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OrderLocationsProps {
  title: string;
  locations: OrderLocation[];
}

// Copyable delivery confirmation code — what the rider needs at the drop-off. Admins use
// it to recover/resolve a delivery, so it's prominent and one-tap copyable.
const DeliveryCode: React.FC<{ code: string; name?: string }> = ({ code, name }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy delivery code"
      className="inline-flex items-center gap-1.5 rounded-md bg-primary-purple/10 px-2 py-1 text-[11px] font-bold text-primary-purple transition-colors hover:bg-primary-purple/20"
    >
      <ShieldCheck size={12} />
      <span className="font-semibold text-primary-gray">{name ? name : "Delivery code"}</span>
      <span className="tracking-[0.15em]">{code}</span>
      {copied ? <Check size={12} /> : <Copy size={12} className="opacity-50" />}
    </button>
  );
};

export const OrderLocations: React.FC<OrderLocationsProps> = ({ title, locations }) => {
  const router = useRouter();

  return (
    <div className="space-y-4 max-h-[9.4rem] pr-4 scroll-bar overflow-y-auto">
      {locations.map((location, i) => {
        // Multi-recipient drop-off: one code per person; otherwise the stop's own code.
        const codes: { code: string; name?: string }[] = location.recipients?.length
          ? location.recipients
              .filter((r) => r.confirmationCode)
              .map((r) => ({ code: r.confirmationCode, name: r.name }))
          : location.confirmationCode
            ? [{ code: location.confirmationCode }]
            : [];

        return (
          <div key={i} className="*:font-montserrat flex items-start gap-x-3">
            <span className="mt-0.5 rounded-lg bg-muted size-6 grid place-items-center shrink-0">
              <MapPin size={13} />
            </span>
            <div className="min-w-0">
              <span className="block text-xs text-primary-gray font-semibold">
                {title} {locations.length > 1 ? i + 1 : ""}
              </span>
              <span className="text-sm font-semibold text-primary-purple">{location.address}</span>
              {codes.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {codes.map((c, ci) => (
                    <DeliveryCode key={ci} code={c.code} name={c.name} />
                  ))}
                </div>
              )}
            </div>
            <div className="ms-auto flex items-center gap-x-2 shrink-0">
              <UI.Button size="icon" variant={"ghost"}>
                <SVG.MapSearch className="!size-[20px]" />
              </UI.Button>
              <UI.Button onClick={() => router.push(`?location-details=${location._id}`)} size="icon" variant={"ghost"}>
                <Info className="!size-[20px]" />
              </UI.Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
