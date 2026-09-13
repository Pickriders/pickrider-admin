import { redirect } from "next/navigation";

/** Moved into the admin hub. */
export default function AuditLogPage() {
  redirect("/admin?tab=audit");
}
