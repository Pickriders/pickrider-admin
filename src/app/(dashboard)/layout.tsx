import type { Metadata } from "next";
import { Layout } from "@/components/layouts";
import { Suspense } from "react";
import { LogoutModal } from "./LogoutModal";
import { AccessGuard } from "@/components/layouts/AccessGuard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pickriders platform administration",
};

export default function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-surface min-h-screen">
      <Layout.Header />
      <div className="grid xl:grid-cols-[auto_1fr] grid-cols-1">
        <div className="xl:block hidden">
          <Layout.Sidebar />
        </div>
        <main className="pt-6 sm:px-7 px-4 pb-10 relative min-w-0">
          <div className="2xl:max-w-[73rem] xl:max-w-[70rem] w-full mx-auto min-w-0">
            <AccessGuard>{children}</AccessGuard>
          </div>
        </main>
      </div>
      {/* Modals */}
      <Suspense>
        <LogoutModal />
      </Suspense>
    </div>
  );
}
