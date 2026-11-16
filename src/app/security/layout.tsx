import { Metadata } from "next";

import { AuthShell } from "@/components/layouts/AuthShell";

export const metadata: Metadata = {
  title: "Account security",
  description: "Confirm a security action on your Pickriders admin account.",
};

/**
 * Screens reached outside the console: the confirmation page security emails link to, and the
 * authenticator setup-only screen a restricted session is sent to. Reachable with or without a
 * session (see middleware.ts).
 */
export default function SecurityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthShell>{children}</AuthShell>;
}
