import { redirect } from "next/navigation";

import { legacySettingsRedirect } from "@/lib/admin/settings-tabs";

/** Moved into Settings; kept so old links and the account emails still land on the right tab. */
export default function ChangePasswordPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  redirect(legacySettingsRedirect("/dashboard/change-password", searchParams));
}
