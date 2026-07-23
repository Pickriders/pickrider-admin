import { Metadata } from "next";
import { SVG } from "@/components/svg";
import { BarChart3, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Pickriders admin console.",
};

const HIGHLIGHTS = [
  { icon: <BarChart3 size={18} />, title: "Live analytics", body: "Orders, revenue and growth in real time." },
  { icon: <Truck size={18} />, title: "Full operations", body: "Riders, vehicles, businesses and orders." },
  { icon: <ShieldCheck size={18} />, title: "Role-based access", body: "Scoped views for every staff role." },
];

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center p-4 sm:p-6">
      <div className="relative hidden h-[calc(100vh-3rem)] w-[34rem] shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1F1F] via-[#2E1030] to-[#3FA49F] p-9 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-2">
          <SVG.PickridersLogo className="h-9 w-auto fill-white stroke-white" />
        </div>

        <div className="mt-auto">
          <h2 className="font-clash-display text-3xl font-semibold leading-tight">
            The command center for everything Pickriders.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            One console for orders, couriers, businesses and finances across the platform.
          </p>

          <div className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-white/60">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="z-40 mx-auto w-full max-w-[32rem] px-2">{children}</div>
    </div>
  );
}
