import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPrefsProvider } from "@/components/kit/prefs";
import { Layout } from "@/components/layouts";
import { AccessGuard } from "@/components/layouts/AccessGuard";
import { MfaGraceBanner } from "@/components/security/mfa-grace-banner";
import { StepUpDialog } from "@/components/security/step-up-dialog";

import { EmailPauseBanner } from "./emails/_components/email-pauses";
import { WithdrawalFreezeBanner } from "./finances/withdrawal-freeze";
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
        {/* Platform-wide notices: a withdrawal freeze or email pause everyone should know about, and this admin's MFA setup deadline. */}
        <WithdrawalFreezeBanner />
        <EmailPauseBanner />
        <MfaGraceBanner />
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
        {/* Asked for by the API client when a request needs a fresh authenticator code (428). */}
        <StepUpDialog />
      </div>
    </AdminPrefsProvider>
  );
}
