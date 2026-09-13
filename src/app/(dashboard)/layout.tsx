import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPrefsProvider } from "@/components/kit/prefs";
import { Layout } from "@/components/layouts";
import { AccessGuard } from "@/components/layouts/AccessGuard";

import { LogoutModal } from "./LogoutModal";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pickriders platform administration",
};

export default function Dashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminPrefsProvider>
      <div className="min-h-screen bg-surface">
        <Layout.Header />
        <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr]">
          <div className="hidden xl:block">
            <Layout.Sidebar />
          </div>
          <main className="relative min-w-0 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full min-w-0 max-w-[88rem]">
              <AccessGuard>{children}</AccessGuard>
            </div>
          </main>
        </div>
        <Suspense>
          <LogoutModal />
        </Suspense>
      </div>
    </AdminPrefsProvider>
  );
}
