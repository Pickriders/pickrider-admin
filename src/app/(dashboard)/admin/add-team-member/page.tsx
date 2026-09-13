import { redirect } from "next/navigation";

/** Moved into the admin hub; the form opens in a drawer. */
export default function AddTeamMemberPage() {
  redirect("/admin?tab=team&add=1");
}
