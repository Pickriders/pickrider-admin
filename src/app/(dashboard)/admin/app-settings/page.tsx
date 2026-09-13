import { redirect } from "next/navigation";

/** Moved into the admin hub. */
export default function AppSettingsPage() {
  redirect("/admin?tab=settings");
}
