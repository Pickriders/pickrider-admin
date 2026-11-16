import { redirect } from "next/navigation";

import { adminHubRedirect } from "@/lib/admin/settings-tabs";

/** The Admin hub merged into Settings: its tabs live there now, query kept for the drawers. */
export default function AdminPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  redirect(adminHubRedirect(searchParams));
}
