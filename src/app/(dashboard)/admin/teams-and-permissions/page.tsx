import { redirect } from "next/navigation";

/** Moved into the admin hub. */
export default function TeamsAndPermissionsPage() {
  redirect("/admin?tab=team");
}
