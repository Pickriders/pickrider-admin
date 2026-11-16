import { Metadata } from "next";

import { AuthShell } from "@/components/layouts/AuthShell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Pickriders admin console.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthShell>{children}</AuthShell>;
}
